import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "@playwright/test";

const isWindows = process.platform === "win32";
const configDir = path.dirname(fileURLToPath(import.meta.url));
const backendCommand = isWindows
  ? "py -m uvicorn app.main:app --host 127.0.0.1 --port 38011"
  : "python -m uvicorn app.main:app --host 127.0.0.1 --port 38011";
const frontendCommand = isWindows ? "npm.cmd run dev:e2e" : "npm run dev:e2e";
const backendCwd = path.resolve(configDir, "../backend");
const frontendCwd = path.resolve(configDir);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  timeout: 45_000,
  use: {
    baseURL: "http://127.0.0.1:43173",
    headless: true,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: backendCommand,
      url: "http://127.0.0.1:38011/health",
      reuseExistingServer: false,
      cwd: backendCwd,
      timeout: 60_000,
    },
    {
      command: frontendCommand,
      url: "http://127.0.0.1:43173",
      reuseExistingServer: false,
      cwd: frontendCwd,
      timeout: 60_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
});
