import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/AI Affiliate OS/);
});

test("dashboard loads", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("Dashboard Overview")).toBeVisible();
});

test("health API returns ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.status).toBe("ok");
});
