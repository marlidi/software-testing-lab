// Конфігурація Playwright
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://madebymary.pl',
    headless: true,
    screenshot: 'only-on-failure',
  },
});
