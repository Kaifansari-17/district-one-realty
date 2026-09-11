import { createApp } from "@/app";

/** A fresh Express app instance for supertest — never calls .listen(), no port binding. */
export const app = createApp();
