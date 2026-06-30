import { defineConfig } from "@playwright/test";

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
      command: "py -m uvicorn app.main:app --host 127.0.0.1 --port 38011",
      url: "http://127.0.0.1:38011/health",
      reuseExistingServer: false,
      cwd: "../backend",
      timeout: 60_000,
    },
    {
      command: "npm.cmd run dev:e2e",
      url: "http://127.0.0.1:43173",
      reuseExistingServer: false,
      cwd: ".",
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
