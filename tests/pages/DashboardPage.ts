import { Page, Locator, expect } from '@playwright/test';

// Tracks pages that already have the notifications handler registered
const pagesWithNotificationHandler = new WeakSet<Page>();

export class DashboardPage {
  readonly page: Page;
  readonly notificationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.notificationMessage = page.getByText(/^You have \d+ unread messages?$/);
  }

  async goto() {
    await this.handleNotificationsModal();
    await this.page.goto('/admin/dashboard');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await expect(this.page).toHaveURL(/\/admin\/dashboard/);
    await this.page.waitForLoadState('load');
  }

  // Closes the notifications modal whenever it appears
  async handleNotificationsModal() {
    if (pagesWithNotificationHandler.has(this.page)) return;
    pagesWithNotificationHandler.add(this.page);

    await this.page.addLocatorHandler(this.notificationMessage, async () => {
      await this.page.evaluate(() => {
        const dialog = Array.from(document.querySelectorAll('[role="dialog"]')).find((d) =>
          /unread messages?/.test(d.textContent ?? ''),
        );
        if (!dialog) return;

        const buttons = Array.from(dialog.querySelectorAll('button'));
        const closeButton =
          buttons.find((b) => b.textContent?.trim() === 'Close') ??
          buttons.find((b) => b.textContent?.trim() === '');
        closeButton?.click();
      });
    });
  }
}