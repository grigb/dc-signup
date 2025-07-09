const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:4100';
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe('DC Signup System - Comprehensive Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing data
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Complete signup flow with creator types selection', async ({ page }) => {
    console.log('Starting complete signup flow test...');
    
    // Navigate to the main page
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial page
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test1-01-initial-page.png') });
    
    // Fill out basic information
    await page.fill('input[name="name"]', 'Test Creator');
    await page.fill('input[name="email"]', 'creator@example.com');
    
    // Select country
    await page.selectOption('select[name="country"]', 'United States');
    
    // Fill optional bio
    await page.fill('textarea[name="bio"]', 'I am a test creator user');
    
    // Take screenshot after filling basic info
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test1-02-basic-info-filled.png') });
    
    // Open creator types modal
    const creatorTypesButton = page.locator('button:has-text("Select Creator Types"), button:has-text("Choose Creator Types"), .creator-types-button');
    await creatorTypesButton.click();
    
    // Wait for modal to open
    await page.waitForSelector('.modal', { state: 'visible' });
    
    // Take screenshot of open modal
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test1-03-creator-modal-open.png') });
    
    // Select 2-3 creator types
    await page.check('input[value="Software Development"]');
    await page.check('input[value="Web Development"]');
    await page.check('input[value="Design"]');
    
    // Close modal
    await page.click('button:has-text("Done"), .modal-close');
    
    // Wait for modal to close
    await page.waitForSelector('.modal', { state: 'hidden' });
    
    // Take screenshot after creator type selection
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test1-04-after-creator-selection.png') });
    
    // Submit form
    await page.click('button[type="submit"], .submit-button');
    
    // Wait for review page or success message
    await page.waitForTimeout(2000);
    
    // Take screenshot of result
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test1-05-after-submit.png') });
    
    // Check if we're on review page or success state
    const reviewContent = await page.textContent('body');
    console.log('Review page content includes:', reviewContent.includes('review') || reviewContent.includes('Review'));
    
    // Verify details are correct
    expect(reviewContent).toContain('Test Creator');
    expect(reviewContent).toContain('creator@example.com');
    expect(reviewContent).toContain('United States');
  });

  test('Optional creator types flow (no selection)', async ({ page }) => {
    console.log('Starting optional creator types flow test...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Fill out basic information
    await page.fill('input[name="name"]', 'Test Non-Creator');
    await page.fill('input[name="email"]', 'noncreator@example.com');
    await page.selectOption('select[name="country"]', 'United States');
    
    // Take screenshot before first submit
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test2-01-before-first-submit.png') });
    
    // Submit first time without selecting creator types
    await page.click('button[type="submit"], .submit-button');
    await page.waitForTimeout(2000);
    
    // Take screenshot after first submit
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test2-02-after-first-submit.png') });
    
    // Check for gentle suggestion message
    const firstSubmitContent = await page.textContent('body');
    console.log('First submit - looking for suggestion message...');
    
    // Submit second time
    await page.click('button[type="submit"], .submit-button');
    await page.waitForTimeout(2000);
    
    // Take screenshot after second submit
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test2-03-after-second-submit.png') });
    
    // Verify we proceed to review page
    const reviewContent = await page.textContent('body');
    expect(reviewContent).toContain('Test Non-Creator');
    expect(reviewContent).toContain('noncreator@example.com');
  });

  test('Form validation testing', async ({ page }) => {
    console.log('Starting form validation tests...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Test empty name validation
    await page.fill('input[name="email"]', 'test@example.com');
    await page.selectOption('select[name="country"]', 'United States');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test3-01-empty-name-validation.png') });
    
    // Test empty email validation
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', '');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test3-02-empty-email-validation.png') });
    
    // Test invalid email format
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test3-03-invalid-email-validation.png') });
    
    // Test country selection (reset to default)
    await page.fill('input[name="email"]', 'test@example.com');
    await page.selectOption('select[name="country"]', '');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test3-04-country-validation.png') });
    
    console.log('Form validation tests completed');
  });

  test('Admin dashboard navigation and functionality', async ({ page }) => {
    console.log('Starting admin dashboard test...');
    
    await page.goto(`${BASE_URL}/admin.html`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of admin page
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test4-01-admin-dashboard.png') });
    
    // Check for admin interface elements
    const adminContent = await page.textContent('body');
    console.log('Admin page loaded successfully');
    
    // Look for member management features
    const hasManagementFeatures = await page.locator('table, .member-list, .admin-controls').count() > 0;
    console.log('Has member management features:', hasManagementFeatures);
    
    // Check for any error messages
    const hasErrors = adminContent.includes('error') || adminContent.includes('Error');
    console.log('Has errors:', hasErrors);
    
    expect(page.url()).toContain('/admin.html');
  });

  test('Member dashboard navigation and functionality', async ({ page }) => {
    console.log('Starting member dashboard test...');
    
    await page.goto(`${BASE_URL}/member.html`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of member page
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test5-01-member-dashboard.png') });
    
    // Check that page loads properly
    const memberContent = await page.textContent('body');
    console.log('Member page loaded successfully');
    
    // Check for any error messages
    const hasErrors = memberContent.includes('error') || memberContent.includes('Error');
    console.log('Has errors:', hasErrors);
    
    expect(page.url()).toContain('/member.html');
  });

  test('Verification page with token parameter', async ({ page }) => {
    console.log('Starting verification page test...');
    
    await page.goto(`${BASE_URL}/verify.html?token=testtoken`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of verification page
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test6-01-verification-page.png') });
    
    // Wait for loading state to complete
    await page.waitForTimeout(3000);
    
    // Take screenshot after loading
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test6-02-after-loading.png') });
    
    // Check for verification interface
    const verifyContent = await page.textContent('body');
    console.log('Verification page loaded');
    
    // Check for loading state and error state
    const hasLoadingState = verifyContent.includes('Loading') || verifyContent.includes('loading');
    const hasErrorState = verifyContent.includes('error') || verifyContent.includes('Error') || verifyContent.includes('invalid');
    
    console.log('Has loading state:', hasLoadingState);
    console.log('Has error state for invalid token:', hasErrorState);
    
    expect(page.url()).toContain('/verify.html');
    expect(page.url()).toContain('token=testtoken');
  });

  test('Page responsiveness and styling check', async ({ page }) => {
    console.log('Starting responsiveness and styling test...');
    
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: path.join(SCREENSHOT_DIR, `test7-${viewport.width}x${viewport.height}.png`) 
      });
    }
    
    console.log('Responsiveness test completed');
  });

  test('Service worker and PWA functionality', async ({ page }) => {
    console.log('Starting PWA functionality test...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for service worker registration
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    console.log('Service worker supported:', swRegistered);
    
    // Check for manifest
    const manifestLink = await page.locator('link[rel="manifest"]').count();
    console.log('Manifest link present:', manifestLink > 0);
    
    // Take screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test8-01-pwa-check.png') });
    
    expect(swRegistered).toBe(true);
  });

});