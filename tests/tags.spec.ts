import { test, expect } from '@playwright/test';
import { TagsPage } from './pages/TagsPage';
import tagData from '../tests/test-data/Tags.json';

test.describe('Inventory - Tags', () => {
  test('user can create tag', async ({ page }) => {
    const tags = new TagsPage(page);
    const tagName = `${tagData.tagName}_${Date.now()}`; // Unique tag name per run

    await tags.open();
    await tags.createTag(tagName);

    await expect(page.getByRole('row', { name: tagName })).toBeVisible();
  });

  test('user can edit tag', async ({ page }) => {
    const tags = new TagsPage(page);
    const tagName = `${tagData.tagName}_${Date.now()}`;
    const updatedTagName = `${tagName}_Edited`;

    // Create a tag to edit
    await tags.open();
    await tags.createTag(tagName);
    await expect(page.getByRole('row', { name: tagName })).toBeVisible();

    await tags.editTag(tagName, updatedTagName);

    // Updated name is listed and old name is gone
    await expect(page.getByRole('row', { name: updatedTagName })).toBeVisible();
    await expect(page.getByRole('cell', { name: tagName, exact: true })).toHaveCount(0);
  });

  test('user can delete tag', async ({ page }) => {
    const tags = new TagsPage(page);
    const tagName = `${tagData.tagName}_${Date.now()}`;

    // Create a tag to delete
    await tags.open();
    await tags.createTag(tagName);
    await expect(page.getByRole('row', { name: tagName })).toBeVisible();

    await tags.deleteTag(tagName);

    await expect(page.getByRole('row', { name: tagName })).toHaveCount(0);
  });

  test('duplicate tag name is not accepted', async ({ page }) => {
    const tags = new TagsPage(page);
    const tagName = `${tagData.tagName}_${Date.now()}`;

    // Create a tag, then try the same name again
    await tags.open();
    await tags.createTag(tagName);
    await expect(page.getByRole('row', { name: tagName })).toBeVisible();
    await expect(tags.successToast).toBeHidden({ timeout: 15000 });

    // Open a fresh Add Tag form
    await tags.addNewTagLink.click();
    await expect(tags.addTagTitle).toBeVisible();
    await page.reload();
    await expect(tags.addTagTitle).toBeVisible();

    // Retry until the name stays in the field
    await expect(async () => {
      await tags.nameInput.fill(tagName);
      await expect(tags.nameInput).toHaveValue(tagName, { timeout: 1000 });
    }).toPass({ timeout: 15000 });

    await expect(tags.duplicateNameError).toBeHidden();

    // Submit and wait for the save request
    const submitResponse = page.waitForResponse(
      (res) => res.request().method() === 'POST' && /tag/i.test(res.url()),
    );
    await tags.submitButton.click();
    await submitResponse;

    // Validation error shown and form not submitted
    await expect(tags.duplicateNameError).toBeVisible({ timeout: 10000 });
    await expect(tags.addTagTitle).toBeVisible();
    await expect(tags.nameInput).toHaveValue(tagName);
  });
});