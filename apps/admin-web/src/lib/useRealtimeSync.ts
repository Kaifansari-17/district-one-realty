import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { env } from "@/config/env";

const RECONNECT_DELAY_MS = 3000;

function toWebSocketUrl(apiUrl: string): string {
  // apiUrl is like "https://api.districtonerealty.com/api" — the socket is mounted directly on
  // the same host/port outside the Express router, at /ws/admin (not under /api).
  const url = new URL(apiUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/admin";
  url.search = "";
  return url.toString();
}

/**
 * Keeps Admin Web's data in sync with the database in real time: the API pushes a tiny
 * "<resource> changed" event over WebSocket after every successful admin write (see
 * apps/api/src/realtime/adminSocket.ts), and this invalidates the matching React Query cache so
 * the change shows up immediately — instead of waiting out the normal ~30s staleTime, or worse,
 * only ever seeing what another admin changed after a manual refresh.
 *
 * The browser sends the existing httpOnly auth cookie automatically during the WebSocket
 * handshake (same-site, same as any other request to the API) — no token wiring needed here.
 * Falls back gracefully to the existing polling-on-remount behavior if the socket can't connect
 * or drops, via auto-reconnect with a fixed backoff.
 */
export function useRealtimeSync(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: WebSocket | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      socket = new WebSocket(toWebSocketUrl(env.apiUrl));

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string) as { type?: string; resource?: string };
          if (message.type === "invalidate" && message.resource) {
            queryClient.invalidateQueries({ queryKey: [message.resource] });
          }
        } catch {
          // Ignore malformed messages rather than crash the socket handler.
        }
      };

      socket.onclose = () => {
        if (!stopped) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    };

    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [queryClient]);
}
