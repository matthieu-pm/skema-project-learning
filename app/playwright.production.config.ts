import { defineConfig } from "@playwright/test";

// Exercise extracted production assets: Vite dev injects CSS in a different order.
export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/sidebar-availability.spec.ts", "**/inline-editor.spec.ts", "**/workspace-styles.spec.ts", "**/usability-learner.spec.ts", "**/booking-calendar.spec.ts", "**/usability-onboarding.spec.ts"],
  use: { baseURL: "http://127.0.0.1:4181", viewport: { width: 1280, height: 900 } },
  webServer: {
    command: "npm run build && npm exec vite preview -- --host 127.0.0.1 --port 4181 --strictPort",
    url: "http://127.0.0.1:4181",
    reuseExistingServer: false,
  },
});
