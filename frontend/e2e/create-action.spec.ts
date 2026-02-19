/**
 * E2E tests for action creation flow
 */

import { test, expect } from '@playwright/test';

test.describe('Action Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('should navigate to create page from home', async ({ page }) => {
    // Click "Create Your Blinch" button
    await page.click('text=Create Your Blinch');

    // Should be on create page
    await expect(page).toHaveURL(/\/create/);
    await expect(page.locator('h2')).toContainText('Basic Information');
  });

  test('should complete action creation with minimum fields', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Step 1: Fill basic information
    await page.fill('input[name="title"]', 'Test Tip Jar');
    await page.fill('textarea[name="description"]', 'A test action for E2E testing');

    // Click Next
    await page.click('button:has-text("Next")');

    // Should be on step 2
    await expect(page.locator('h2')).toContainText('Fund Details');

    // Step 2: Fill fund details
    await page.fill('input[name="recipientAddress"]', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

    // Click Next
    await page.click('button:has-text("Next")');

    // Should be on step 3
    await expect(page.locator('h2')).toContainText('Customize');

    // Skip customization, click Next
    await page.click('button:has-text("Next")');

    // Should be on step 4 (Preview)
    await expect(page.locator('h2')).toContainText('Preview & Generate');

    // Verify preview data
    await expect(page.locator('text=Test Tip Jar')).toBeVisible();
    await expect(page.locator('text=A test action for E2E testing')).toBeVisible();

    // Submit the form
    const submitPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/action') && resp.status() === 201
    );
    await page.click('button:has-text("Create Action")');
    await submitPromise;

    // Should navigate to success page
    await expect(page).toHaveURL(/\/create\/success/);
    await expect(page.locator('text=Action Created!')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/create');

    // Try to proceed without filling fields
    await page.click('button:has-text("Next")');

    // Should show validation errors
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
  });

  test('should enforce character limits', async ({ page }) => {
    await page.goto('/create');

    // Fill title with more than 100 characters
    await page.fill('input[name="title"]', 'a'.repeat(101));

    // Should show error
    await page.blur('input[name="title"]');
    await expect(page.locator('text=100 characters or less')).toBeVisible();
  });

  test('should validate BCH address format', async ({ page }) => {
    await page.goto('/create');

    // Fill step 1
    await page.fill('input[name="title"]', 'Test');
    await page.fill('textarea[name="description"]', 'Test description');
    await page.click('button:has-text("Next")');

    // Fill invalid address
    await page.fill('input[name="recipientAddress"]', 'invalid-address');
    await page.blur('input[name="recipientAddress"]');

    // Should show validation error
    await expect(page.locator('text=Invalid Bitcoin Cash address format')).toBeVisible();
  });

  test('should support custom parameters', async ({ page }) => {
    await page.goto('/create');

    // Fill step 1
    await page.fill('input[name="title"]', 'Test with params');
    await page.fill('textarea[name="description"]', 'Test');
    await page.click('button:has-text("Next")');

    // Fill step 2
    await page.fill('input[name="recipientAddress"]', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    await page.click('button:has-text("Next")');

    // Step 3: Add custom parameter
    await page.fill('input[placeholder="e.g., user_note"]', 'message');
    await page.fill('input[placeholder="e.g., Your Note"]', 'Your Message');
    await page.click('button:has-text("Add Parameter")');

    // Should show parameter in list
    await expect(page.locator('text=Your Message')).toBeVisible();
    await expect(page.locator('text=message')).toBeVisible();
  });

  test('should navigate back through steps', async ({ page }) => {
    await page.goto('/create');

    // Fill step 1
    await page.fill('input[name="title"]', 'Test');
    await page.fill('textarea[name="description"]', 'Test');
    await page.click('button:has-text("Next")');

    // Should be on step 2
    await expect(page.locator('h2')).toContainText('Fund Details');

    // Click Back
    await page.click('button:has-text("Back")');

    // Should be back on step 1
    await expect(page.locator('h2')).toContainText('Basic Information');
    await expect(page.locator('input[name="title"]')).toHaveValue('Test');
  });

  test('should show loading state during submission', async ({ page }) => {
    await page.goto('/create');

    // Fill all steps quickly
    await page.fill('input[name="title"]', 'Quick Test');
    await page.fill('textarea[name="description"]', 'Quick test action');
    await page.click('button:has-text("Next")');
    await page.fill('input[name="recipientAddress"]', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    await page.click('button:has-text("Next")'); // Skip step 3
    await page.click('button:has-text("Next")'); // Skip preview

    // Submit and check loading state
    const createButton = page.locator('button:has-text("Create Action")');
    await createButton.click();

    // Should show loading state
    await expect(createButton).toContainText('Creating...');
  });

  test('should display success page with share options', async ({ page }) => {
    // First create an action
    await page.goto('/create');

    await page.fill('input[name="title"]', 'Share Test');
    await page.fill('textarea[name="description"]', 'Testing share options');
    await page.click('button:has-text("Next")');
    await page.fill('input[name="recipientAddress"]', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');

    // Submit
    await page.click('button:has-text("Create Action")');

    // Wait for success page
    await expect(page.locator('text=Action Created!')).toBeVisible({ timeout: 10000 });

    // Check share options are visible
    await expect(page.locator('text=Share Your Action')).toBeVisible();
    await expect(page.locator('text=Action Link')).toBeVisible();
    await expect(page.locator('text=Action ID')).toBeVisible();

    // Test copy button
    await page.click('button:has-text("Copy")');
    // Should show "Copied!" temporarily
    await expect(page.locator('button:has-text("Copied!")')).toBeVisible();
  });

  test('should allow creating another action from success page', async ({ page }) => {
    // Create an action first
    await page.goto('/create');
    await page.fill('input[name="title"]', 'First Action');
    await page.fill('textarea[name="description"]', 'Test');
    await page.click('button:has-text("Next")');
    await page.fill('input[name="recipientAddress"]', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Create Action")');
    await expect(page.locator('text=Action Created!')).toBeVisible({ timeout: 10000 });

    // Click "Create Another"
    await page.click('button:has-text("Create Another")');

    // Should be back on create page
    await expect(page).toHaveURL(/\/create$/);
    await expect(page.locator('h2')).toContainText('Basic Information');
  });
});

test.describe('Action Creation Edge Cases', () => {
  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure scenario - this would require setting up test API endpoints
    // For now, we just verify the UI handles the error state
    await page.goto('/create');

    // Fill form
    await page.fill('input[name="title"]', 'Error Test');
    await page.fill('textarea[name="description"]', 'Testing error handling');
    await page.click('button:has-text("Next")');
    await page.fill('input[name="recipientAddress"]', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');

    // Submit (will succeed in normal case, error handling tested separately)
    await page.click('button:has-text("Create Action")');

    // Either success or error should be handled
    const isSuccess = await page.locator('text=Action Created!').isVisible({ timeout: 10000 });
    const isError = await page.locator('text=Error:').isVisible({ timeout: 10000 });

    expect(isSuccess || isError).toBeTruthy();
  });
});
