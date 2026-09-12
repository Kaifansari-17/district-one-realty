import type { Server as HttpServer, IncomingMessage } from "node:http";
import type { Socket } from "node:net";
import { WebSocketServer, WebSocket } from "ws";
import { verifyAccessToken } from "@/utils/jwt";
import { ACCESS_TOKEN_COOKIE } from "@/utils/cookies";
import { logger } from "@/utils/logger";

const ADMIN_SOCKET_PATH = "/ws/admin";
const HEARTBEAT_INTERVAL_MS = 30_000;

let broadcast: ((resource: string) => void) | undefined;

interface TrackedSocket extends WebSocket {
  isAlive?: boolean;
}

function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;
    if (part.slice(0, separatorIndex).trim() === name) {
      return decodeURIComponent(part.slice(separatorIndex + 1).trim());
    }
  }
  return undefined;
}

/**
 * Pushes "this resource changed" events to connected Admin Web clients so their React Query
 * cache invalidates immediately instead of waiting out the normal staleTime window (previously
 * up to ~1 minute). Deliberately payload-free — clients refetch the resource themselves — so a
 * broadcast never leaks data to a socket that shouldn't see it and stays trivially cheap.
 */
export function initAdminRealtime(server: HttpServer): void {
  const wss = new WebSocketServer({ noServer: true });
  const clients = new Set<TrackedSocket>();

  server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
    const url = new URL(req.url ?? "", "http://internal");
    if (url.pathname !== ADMIN_SOCKET_PATH) return; // not ours — leave for any other upgrade handler

    const token = readCookie(req.headers.cookie, ACCESS_TOKEN_COOKIE);
    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    try {
      verifyAccessToken(token);
    } catch {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws: TrackedSocket) => {
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
    ws.on("error", () => clients.delete(ws));
  });

  // Drops connections the reverse proxy silently dropped without a close frame, so `clients`
  // never accumulates dead sockets under a long-running process.
  const heartbeat = setInterval(() => {
    for (const ws of clients) {
      if (ws.isAlive === false) {
        ws.terminate();
        clients.delete(ws);
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, HEARTBEAT_INTERVAL_MS);
  heartbeat.unref();

  wss.on("close", () => clearInterval(heartbeat));

  broadcast = (resource: string) => {
    const message = JSON.stringify({ type: "invalidate", resource });
    for (const ws of clients) {
      if (ws.readyState === WebSocket.OPEN) ws.send(message);
    }
  };

  logger.info(`Admin realtime WebSocket listening at ${ADMIN_SOCKET_PATH}`);
}

/**
 * Notifies connected Admin Web clients that `resource` (matching the same string used as the
 * React Query key, e.g. "properties", "leads") has changed. A no-op until `initAdminRealtime`
 * has run — safe to call from anywhere without threading the server instance through.
 */
export function broadcastResourceChange(resource: string): void {
  broadcast?.(resource);
}
