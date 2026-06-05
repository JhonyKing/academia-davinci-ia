import { defineConfig, devices } from '@playwright/test';

/**
 * Tests para Academia Da Vinci IA
 * Por defecto apunta a producción.
 * Para correr local: BASE_URL=http://localhost:8080 npx playwright test
 */
const BASE_URL = process.env.BASE_URL ?? 'https://academia-davinci-ia.vercel.app';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['line'],
  ],

  use: {
    baseURL: BASE_URL,
    locale: 'es-MX',
    timezoneId: 'America/Matamoros',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
