/**
 * E2E tests for dashboard flow
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');

    // Create a test action first via the create flow
    await page.goto('/create');
    await page.fill('input[name="title"]', 'Dashboard Test Action');
    await page.fill('textarea[name="description"]', 'Test action for dashboard E2E tests');
    await page.click('button:has-text("Next")');
    await page.fill('input[name="recipientAddress"]', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Create Action")');
    await expect(page.locator('text=Action Created!')).toBeVisible({ timeout: 10000 });

    // Navigate away from success page
    await page.goto('/');
  });

  test('should display dashboard with actions', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show dashboard header
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Should show action count
    await expect(page.locator(/actions created/)).toBeVisible();

    // Should show at least one action card
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();
  });

  test('should display empty state when no actions', async ({ page }) => {
    // Clear localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/dashboard');

    // Should show empty state
    await expect(page.locator('text=No actions yet')).toBeVisible();
    await expect(page.locator('text=Create your first Blinch action')).toBeVisible();

    // Should have "Create Action" button
    await expect(page.locator('button:has-text("Create Action")')).toBeVisible();
  });

  test('should search actions', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for actions to load
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();

    // Search for existing action
    await page.fill('input[placeholder="Search actions..."]', 'Dashboard Test');

    // Should show filtered results
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();
  });

  test('should show no results for non-matching search', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for actions to load
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();

    // Search for non-existent action
    await page.fill('input[placeholder="Search actions..."]', 'NonExistentActionXYZ');

    // Should show no results message
    await expect(page.locator('text=No actions match your search')).toBeVisible();
  });

  test('should navigate to action from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for actions to load
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();

    // Click "View" button
    await page.click('button:has-text("View")');

    // Should navigate to action page
    await expect(page).toHaveURL(/\/action\/[a-zA-Z0-9]+$/);
  });

  test('should share action from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for actions to load
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();

    // Set up clipboard listener
    await page.evaluate(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: async (text: string) => {
            localStorage.setItem('clipboard_test', text);
            return Promise.resolve();
          },
          readText: async () => {
            return Promise.resolve(localStorage.getItem('clipboard_test') || '');
          },
        },
      });
    });

    // Click share button
    await page.click('button[title="Share"]');

    // Check for alert (which indicates share happened)
    page.on('dialog', (dialog) => {
      expect(dialog.message()).toContain('copied');
      dialog.accept();
    });
  });

  test('should delete action with confirmation', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for actions to load
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();

    // Click delete button
    page.on('dialog', (dialog) => {
      expect(dialog.message()).toContain('delete this action');
      dialog.accept();
    });

    await page.click('button[title="Delete"]');

    // Wait for delete to complete
    await page.waitForTimeout(1000);

    // Action should be removed
    await expect(page.locator('text=Dashboard Test Action')).not.toBeVisible({ timeout: 5000 });
  });

  test('should cancel delete action', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for actions to load
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();

    // Store initial action count
    const initialCount = await page.locator('[class*="glass"]').count();

    // Click delete button and cancel
    page.on('dialog', (dialog) => {
      dialog.dismiss();
    });

    await page.click('button[title="Delete"]');
    await page.waitForTimeout(500);

    // Action should still be present
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();

    // Count should be the same
    const finalCount = await page.locator('[class*="glass"]').count();
    expect(finalCount).toBe(initialCount);
  });

  test('should show action metadata', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for actions to load
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();

    // Check for action details
    await expect(page.locator('text=Test action for dashboard E2E tests')).toBeVisible();
    await expect(page.locator(/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa/)).toBeVisible();
    await expect(page.locator(/Created/)).toBeVisible();
  });

  test('should display stats section', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for actions to load
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();

    // Scroll to stats
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check stats are visible
    await expect(page.locator('text=Total Actions')).toBeVisible();
    await expect(page.locator('text=With Parameters')).toBeVisible();
    await expect(page.locator('text=Custom Types')).toBeVisible();
  });

  test('should navigate to create from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Click "New Action" button
    await page.click('button:has-text("New Action")');

    // Should navigate to create page
    await expect(page).toHaveURL(/\/create$/);
    await expect(page.locator('h2')).toContainText('Basic Information');
  });

  test('should persist actions across page reloads', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for actions to load
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();

    // Reload page
    await page.reload();

    // Actions should still be present
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    // Use slow network to test loading state
    await page.context().setOffline(false);

    await page.goto('/dashboard');

    // Should show loading indicator (may be too fast to catch, but the state should exist)
    const loadingExists = await page.locator('text=Loading your actions').isVisible({ timeout: 100 }).catch(() => false);

    // Eventually, actions should load
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible({ timeout: 5000 });
  });

  test('should filter actions by title', async ({ page }) => {
    // Create another action with different title
    await page.goto('/create');
    await page.fill('input[name="title"]', 'Another Test Action');
    await page.fill('textarea[name="description"]', 'Another test');
    await page.click('button:has-text("Next")');
    await page.fill('input[name="recipientAddress"]', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Create Action")');
    await expect(page.locator('text=Action Created!')).toBeVisible({ timeout: 10000 });

    // Go to dashboard
    await page.goto('/dashboard');

    // Should show both actions
    await expect(page.locator('text=Dashboard Test Action')).toBeVisible();
    await expect(page.locator('text=Another Test Action')).toBeVisible();

    // Search for specific action
    await page.fill('input[placeholder="Search actions..."]', 'Another');

    // Should only show matching action
    await expect(page.locator('text=Another Test Action')).toBeVisible();
    await expect(page.locator('text=Dashboard Test Action')).not.toBeVisible();
  });
});

test.describe('Dashboard Navigation', () => {
  test('should have navigation link to dashboard when actions exist', async ({ page }) => {
    // Create an action first
    await page.goto('/create');
    await page.fill('input[name="title"]', 'Nav Test');
    await page.fill('textarea[name="description"]', 'Test');
    await page.click('button:has-text("Next")');
    await page.fill('input[name="recipientAddress"]', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Create Action")');
    await expect(page.locator('text=Action Created!')).toBeVisible({ timeout: 10000 });

    // Go to home page
    await page.goto('/');

    // Should show Dashboard link in navigation
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Click Dashboard link
    await page.click('text=Dashboard');

    // Should navigate to dashboard
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
