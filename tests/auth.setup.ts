import { test as setup } from '@playwright/test';
import fs from 'fs';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

const authFile = 'playwright/.auth/user.json';
const SESSION_REUSE_MS = 90 * 60 * 1000; // Reuse saved session for 90 min

setup('authenticate', async ({ page }) => {
  // Skip login if a recent session exists
  const isFresh =
    fs.existsSync(authFile) &&
    Date.now() - fs.statSync(authFile).mtimeMs < SESSION_REUSE_MS;
  setup.skip(isFresh, 'Reusing saved login session');

  const username = process.env.POS_USERNAME;
  const password = process.env.POS_PASSWORD;
  if (!username || !password) {
    throw new Error('Set POS_USERNAME and POS_PASSWORD in the .env file');
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, password);

  await page.waitForURL('**/admin/dashboard');
  await new DashboardPage(page).waitForLoad();

  await page.context().storageState({ path: authFile });
});