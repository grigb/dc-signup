const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('DC Signup Form Testing', () => {
    let page;
    let consoleMessages = [];
    let errors = [];

    test.beforeEach(async ({ page: testPage }) => {
        page = testPage;
        consoleMessages = [];
        errors = [];

        // Capture console messages and errors
        page.on('console', (msg) => {
            const text = msg.text();
            console.log(`Console ${msg.type()}: ${text}`);
            consoleMessages.push({ type: msg.type(), text });
        });

        page.on('pageerror', (error) => {
            console.log(`Page Error: ${error.message}`);
            errors.push(error.message);
        });

        // Navigate to the form using baseURL provided by Playwright config
        await page.goto('/');
    });

    test('Load form and capture initial errors', async () => {
        // Wait for the page to fully load
        await page.waitForTimeout(2000);

        // Take initial screenshot
        await page.screenshot({ 
            path: 'screenshots/01-initial-load.png', 
            fullPage: true 
        });

        // Check for JavaScript errors during load
        console.log('\n=== JAVASCRIPT ERRORS ON LOAD ===');
        errors.forEach(error => {
            console.log(`ERROR: ${error}`);
        });

        console.log('\n=== CONSOLE MESSAGES DURING LOAD ===');
        consoleMessages.forEach(msg => {
            console.log(`${msg.type.toUpperCase()}: ${msg.text}`);
        });

        // Check if critical elements are present
        const nameInput = await page.locator('#name');
        const emailInput = await page.locator('#email');
        const submitBtn = await page.locator('#submitBtn');
        const creatorTypeDisplay = await page.locator('#creatorTypeDisplay');

        await expect(nameInput).toBeVisible();
        await expect(emailInput).toBeVisible();
        await expect(submitBtn).toBeVisible();
        await expect(creatorTypeDisplay).toBeVisible();

        // Check connection status
        const connectionStatus = await page.locator('#connectionStatus');
        const statusText = await connectionStatus.textContent();
        console.log(`\nConnection Status: ${statusText}`);
    });

    test('Test form filling and creator type modal', async () => {
        // Fill out basic form fields
        await page.fill('#name', 'Test User');
        await page.fill('#email', 'test@example.com');
        
        // Select country
        await page.selectOption('#country', 'United States');

        // Take screenshot after basic info
        await page.screenshot({ 
            path: 'screenshots/02-basic-info-filled.png', 
            fullPage: true 
        });

        // Try to open creator type modal
        console.log('\n=== ATTEMPTING TO OPEN CREATOR TYPE MODAL ===');
        const creatorTypeSelector = page.locator('.simple-creator-input');
        await expect(creatorTypeSelector).toBeVisible();
        
        // Click to open modal
        await creatorTypeSelector.click();
        await page.waitForTimeout(1000);

        // Check if modal opened
        const modal = page.locator('#creatorTypeModal');
        const modalVisible = await modal.isVisible();
        console.log(`Creator Type Modal Visible: ${modalVisible}`);

        if (modalVisible) {
            // Take screenshot of open modal
            await page.screenshot({ 
                path: 'screenshots/03-creator-type-modal-open.png', 
                fullPage: true 
            });

            // Try to select some creator types
            const firstCategory = page.locator('.category-header').first();
            if (await firstCategory.isVisible()) {
                await firstCategory.click();
                await page.waitForTimeout(500);
            }

            // Try to select a subcategory
            const firstSubcategory = page.locator('.subcategory-card').first();
            if (await firstSubcategory.isVisible()) {
                await firstSubcategory.click();
                await page.waitForTimeout(500);
            }

            // Save selection
            const saveBtn = page.locator('button:has-text("Save Selection")');
            if (await saveBtn.isVisible()) {
                await saveBtn.click();
                await page.waitForTimeout(1000);
            }

            // Take screenshot after modal interaction
            await page.screenshot({ 
                path: 'screenshots/04-after-creator-type-selection.png', 
                fullPage: true 
            });
        } else {
            console.log('MODAL FAILED TO OPEN - investigating...');
            
            // Check for JavaScript errors that might prevent modal from opening
            const modalErrorMessages = consoleMessages.filter(msg => 
                msg.text.includes('modal') || 
                msg.text.includes('creatorTypes') ||
                msg.text.includes('addEventListener')
            );
            
            console.log('Modal-related console messages:');
            modalErrorMessages.forEach(msg => {
                console.log(`${msg.type}: ${msg.text}`);
            });
        }
    });

    test('Test form submission process', async () => {
        // Fill out minimum required fields
        await page.fill('#name', 'Test Submission User');
        await page.fill('#email', 'submission-test@example.com');

        // Try to select creator types manually if modal doesn't work
        const creatorTypeSelector = page.locator('.simple-creator-input');
        await creatorTypeSelector.click();
        await page.waitForTimeout(1000);

        // If modal opens, select something quickly
        const modal = page.locator('#creatorTypeModal');
        if (await modal.isVisible()) {
            // Just click the first category to select it
            const firstCategory = page.locator('.category-header').first();
            await firstCategory.click();
            
            // Save selection
            const saveBtn = page.locator('button:has-text("Save Selection")');
            await saveBtn.click();
            await page.waitForTimeout(1000);
        }

        // Take screenshot before submission
        await page.screenshot({ 
            path: 'screenshots/05-ready-for-submission.png', 
            fullPage: true 
        });

        // Clear any previous error messages
        consoleMessages = [];
        errors = [];

        // Click the Review Submission button
        console.log('\n=== ATTEMPTING FORM SUBMISSION ===');
        const submitBtn = page.locator('#submitBtn');
        await expect(submitBtn).toBeVisible();
        
        console.log('Submit button text:', await submitBtn.textContent());
        
        // Click the submit button
        await submitBtn.click();
        
        // Wait for any reactions
        await page.waitForTimeout(3000);

        // Take screenshot after clicking submit
        await page.screenshot({ 
            path: 'screenshots/06-after-submit-click.png', 
            fullPage: true 
        });

        // Check what happened after submission
        const confirmationStep = page.locator('#confirmationStep');
        const confirmationVisible = await confirmationStep.isVisible();
        console.log(`Confirmation step visible: ${confirmationVisible}`);

        const successMessage = page.locator('#successMessage');
        const successVisible = await successMessage.isVisible();
        console.log(`Success message visible: ${successVisible}`);

        const errorMessage = page.locator('#errorMessage');
        const errorVisible = await errorMessage.isVisible();
        console.log(`Error message visible: ${errorVisible}`);

        if (errorVisible) {
            const errorText = await errorMessage.textContent();
            console.log(`Error message text: ${errorText}`);
        }

        // Log any new JavaScript errors during submission
        console.log('\n=== JAVASCRIPT ERRORS DURING SUBMISSION ===');
        errors.forEach(error => {
            console.log(`ERROR: ${error}`);
        });

        console.log('\n=== CONSOLE MESSAGES DURING SUBMISSION ===');
        consoleMessages.forEach(msg => {
            console.log(`${msg.type.toUpperCase()}: ${msg.text}`);
        });
    });

    test('Test service worker and offline functionality', async () => {
        console.log('\n=== TESTING SERVICE WORKER ===');
        
        // Check if service worker registered
        const swRegistered = await page.evaluate(() => {
            return 'serviceWorker' in navigator;
        });
        console.log(`Service Worker Support: ${swRegistered}`);

        // Wait for any service worker registration attempts
        await page.waitForTimeout(2000);

        // Check for service worker related console messages
        const swMessages = consoleMessages.filter(msg => 
            msg.text.includes('Service Worker') || 
            msg.text.includes('sw.js') ||
            msg.text.includes('registration')
        );
        
        console.log('Service Worker related messages:');
        swMessages.forEach(msg => {
            console.log(`${msg.type}: ${msg.text}`);
        });

        // Test offline mode simulation
        console.log('\n=== TESTING OFFLINE MODE ===');
        await page.goto(`file://${path.join(__dirname, 'index.html')}?offline=true`);
        await page.waitForTimeout(2000);

        // Take screenshot in offline mode
        await page.screenshot({ 
            path: 'screenshots/07-offline-mode.png', 
            fullPage: true 
        });

        const offlineIndicator = page.locator('#testModeIndicator');
        const offlineVisible = await offlineIndicator.isVisible();
        console.log(`Offline mode indicator visible: ${offlineVisible}`);

        const connectionStatus = page.locator('#connectionStatus');
        const statusText = await connectionStatus.textContent();
        console.log(`Connection status in offline mode: ${statusText}`);
    });

    test('Test form validation and error handling', async () => {
        console.log('\n=== TESTING FORM VALIDATION ===');
        
        // Try to submit empty form
        const submitBtn = page.locator('#submitBtn');
        await submitBtn.click();
        await page.waitForTimeout(1000);

        // Check for validation messages
        const errorMessage = page.locator('#errorMessage');
        const errorVisible = await errorMessage.isVisible();
        console.log(`Validation error message visible: ${errorVisible}`);
        
        if (errorVisible) {
            const errorText = await errorMessage.textContent();
            console.log(`Validation error text: ${errorText}`);
        }

        // Test with just name filled
        await page.fill('#name', 'Test Name Only');
        await submitBtn.click();
        await page.waitForTimeout(1000);

        // Test with name and email but no creator type
        await page.fill('#email', 'test-validation@example.com');
        await submitBtn.click();
        await page.waitForTimeout(1000);

        // Take screenshot of validation state
        await page.screenshot({ 
            path: 'screenshots/08-validation-testing.png', 
            fullPage: true 
        });

        // Check console for validation-related messages
        const validationMessages = consoleMessages.filter(msg => 
            msg.text.includes('validation') || 
            msg.text.includes('required') ||
            msg.text.includes('fill')
        );
        
        console.log('Validation related messages:');
        validationMessages.forEach(msg => {
            console.log(`${msg.type}: ${msg.text}`);
        });
    });

    test('Analyze specific error at line 1312', async () => {
        console.log('\n=== ANALYZING LINE 1312 ERROR ===');
        
        // Wait for page to load completely
        await page.waitForTimeout(3000);

        // Look for the specific error mentioned
        const line1312Errors = consoleMessages.filter(msg => 
            msg.text.includes('1312') || 
            msg.text.includes('addEventListener') ||
            msg.text.includes('Cannot read properties of null')
        );

        console.log('Line 1312 related errors:');
        line1312Errors.forEach(msg => {
            console.log(`${msg.type}: ${msg.text}`);
        });

        // Check if navBack element exists (line 1312 tries to add event listener to it)
        const navBackExists = await page.locator('#navBack').count();
        console.log(`navBack element exists: ${navBackExists > 0}`);

        // Check for other elements that might be null
        const elementsToCheck = [
            '#navBack',
            '#otherText', 
            '#creatorTypeModal',
            '#confirmSubmitBtn',
            '#editBtn'
        ];

        for (const selector of elementsToCheck) {
            const exists = await page.locator(selector).count();
            console.log(`Element ${selector} exists: ${exists > 0}`);
        }

        // Take screenshot showing the current DOM state
        await page.screenshot({ 
            path: 'screenshots/09-dom-analysis.png', 
            fullPage: true 
        });
    });
});