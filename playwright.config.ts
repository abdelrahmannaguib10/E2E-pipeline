import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  expect: {
    timeout: 10000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL for API requests */
    baseURL: process.env.API_BASE_URL || 'https://doctrine-amiable-movie.ngrok-free.dev',
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    /* Additional headers for all requests */
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      /* ngrok-free tunnels require this header to skip the browser warning page */
      'ngrok-skip-browser-warning': 'true',
    },
  },
  projects: [
    {
      name: 'api-tests',
      testMatch: /.*\.spec\.ts/,
    },
  ],
});
