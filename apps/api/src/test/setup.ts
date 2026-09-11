import path from "node:path";
import dotenv from "dotenv";

// Must run before any test file imports `@/config/env` (which reads process.env at module load
// time via a Zod schema) — override:true ensures this wins over a real .env that may also be
// present, so tests never accidentally point at the dev/prod database.
//
// .env.test is committed (placeholder values only — no real credentials). .env.test.local is
// gitignored and, when present, layers your machine's real local MySQL credentials on top —
// see .env.test.local's own comment and the Testing section of the README.
dotenv.config({ path: path.resolve(__dirname, "../../.env.test"), override: true });
dotenv.config({ path: path.resolve(__dirname, "../../.env.test.local"), override: true });
