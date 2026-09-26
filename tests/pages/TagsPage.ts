import { Page, Locator, expect } from '@playwright/test';
import { DashboardPage } from './DashboardPage';

export class TagsPage {
  readonly page: Page;
  readonly inventoryMenu: Locator;
  readonly tagsMenu: Locator;
  readonly tagsHeading: Locator;
  readonly addNewTagLink: Locator;
  readonly addTagTitle: Locator;
  readonly editTagTitle: Locator;
  readonly nameInput: Locator;
  readonly submitButton: Locator;
  readonly updateButton: Locator;
  readonly confirmationTitle: Locator;
  readonly deleteWarningMessage: Locator;
  readonly confirmYesButton: Locator;
  readonly duplicateNameError: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryMenu = page.getByRole('navigation').getByRole('link', { name: 'Inventory', exact: true });
    this.tagsMenu = page.getByRole('link', { name: 'Tags' });
    this.tagsHeading = page.getByRole('heading', { name: 'Tags' });
    this.addNewTagLink = page.getByRole('link', { name: 'Add New Tag' });
    this.addTagTitle = page.locator('span:has-text("Add Tag")');
    this.editTagTitle = page.locator('h1:has-text("Edit Tag")');
    this.nameInput = page.getByRole('textbox', { name: 'Name *' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.updateButton = page.getByText('Update', { exact: true });
    this.confirmationTitle = page.getByText('Confirmation', { exact: true });
    this.deleteWarningMessage = page.getByText('Are you sure you want to delete this tag?', { exact: true });
    this.confirmYesButton = page.getByRole('button', { name: 'Yes' });
    this.duplicateNameError = page.getByText('The name has already been taken.', { exact: true });
    this.successToast = page.getByText(/Tag created successfully/);
  }

  async open() {
    await new DashboardPage(this.page).goto();
    await this.inventoryMenu.click();
    await expect(this.page).toHaveURL(/\/admin\/menu\/Inventory/);
    await expect(this.tagsMenu).toBeVisible();
    await this.tagsMenu.click();
    await expect(this.tagsHeading).toBeVisible();
  }

  async createTag(name: string) {
    await this.addNewTagLink.click();
    await expect(this.addTagTitle).toBeVisible();
    await this.nameInput.fill(name);
    await this.submitButton.click();
  }

  // Edit link in the row of the given tag
  editLinkFor(name: string): Locator {
    return this.page
      .getByRole('row', { name })
      .locator('a')
      .filter({ hasText: 'Edit' })
      .first();
  }

  async editTag(currentName: string, newName: string) {
    await this.editLinkFor(currentName).click();
    await expect(this.editTagTitle).toBeVisible();

    // Clear the pre-filled name before entering the new one
    await expect(this.nameInput).toHaveValue(currentName);
    await this.nameInput.clear();
    await expect(this.nameInput).toHaveValue('');
    await this.nameInput.fill(newName);

    await this.updateButton.click();
  }

  // Delete button in the row of the given tag
  deleteButtonFor(name: string): Locator {
    return this.page
      .getByRole('row', { name })
      .locator('button')
      .filter({ hasText: 'Delete' })
      .first();
  }

  async deleteTag(name: string) {
    await this.deleteButtonFor(name).click();

    await expect(this.confirmationTitle).toBeVisible();
    await expect(this.deleteWarningMessage).toBeVisible();

    await this.confirmYesButton.click();
    await expect(this.confirmationTitle).toBeHidden();
  }
}