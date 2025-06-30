const { test, expect } = require('@playwright/test');

test.describe('DC Signup Form HTTP Testing', () => {
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

        // Navigate to the form via HTTP server
        await page.goto('http://localhost:8080');
    });

    test('Test complete form flow via HTTP server', async () => {
        console.log('\n=== TESTING VIA HTTP SERVER ===');
        
        // Wait for the page to fully load
        await page.waitForTimeout(3000);

        // Take initial screenshot
        await page.screenshot({ 
            path: 'screenshots/http-01-initial-load.png', 
            fullPage: true 
        });

        // Check for JavaScript errors during load
        console.log('\n=== JAVASCRIPT ERRORS ON HTTP LOAD ===');
        errors.forEach(error => {
            console.log(`ERROR: ${error}`);
        });

        console.log('\n=== CONSOLE MESSAGES DURING HTTP LOAD ===');
        consoleMessages.forEach(msg => {
            console.log(`${msg.type.toUpperCase()}: ${msg.text}`);
        });

        // Fill out basic form fields
        await page.fill('#name', 'Test HTTP User');
        await page.fill('#email', 'test-http@example.com');
        await page.selectOption('#country', 'United States');

        // Test creator type selection
        console.log('\n=== TESTING CREATOR TYPE SELECTION ===');
        const creatorTypeSelector = page.locator('.simple-creator-input');
        await creatorTypeSelector.click();
        await page.waitForTimeout(2000);

        // Check if modal opened successfully
        const modal = page.locator('#creatorTypeModal');
        const modalVisible = await modal.isVisible();
        console.log(`Creator Type Modal Visible: ${modalVisible}`);

        if (modalVisible) {
            await page.screenshot({ 
                path: 'screenshots/http-02-modal-open.png', 
                fullPage: true 
            });

            // Check if categories loaded
            const categoryCount = await page.locator('.category-header').count();
            console.log(`Number of creator type categories: ${categoryCount}`);

            if (categoryCount > 0) {
                // Select first category
                await page.locator('.category-header').first().click();
                await page.waitForTimeout(500);

                // Save selection
                const saveBtn = page.locator('button:has-text("Save Selection")');
                await saveBtn.click();
                await page.waitForTimeout(1000);

                await page.screenshot({ 
                    path: 'screenshots/http-03-creator-type-selected.png', 
                    fullPage: true 
                });
            }
        }

        // Clear console messages for submission test
        consoleMessages = [];
        errors = [];

        // Test form submission
        console.log('\n=== TESTING FORM SUBMISSION ===');
        const submitBtn = page.locator('#submitBtn');
        await expect(submitBtn).toBeVisible();
        
        console.log('Submit button text:', await submitBtn.textContent());
        
        // Click the submit button
        await submitBtn.click();
        await page.waitForTimeout(3000);

        // Take screenshot after submission attempt
        await page.screenshot({ 
            path: 'screenshots/http-04-after-submit.png', 
            fullPage: true 
        });

        // Check what happened
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

        if (successVisible) {
            const successText = await successMessage.textContent();
            console.log(`Success message text: ${successText}`);
        }

        // Log submission-related console messages
        console.log('\n=== SUBMISSION CONSOLE MESSAGES ===');
        consoleMessages.forEach(msg => {
            console.log(`${msg.type.toUpperCase()}: ${msg.text}`);
        });

        console.log('\n=== SUBMISSION ERRORS ===');
        errors.forEach(error => {
            console.log(`ERROR: ${error}`);
        });
    });

    test('Debug specific line 1312 issue', async () => {
        console.log('\n=== DEBUGGING LINE 1312 ISSUE ===');
        
        await page.waitForTimeout(3000);

        // Check which elements are missing that cause the addEventListener error
        const elementsToCheck = [
            '#navBack',
            '#otherText',
            '#creatorTypeNav',
            '#navPath',
            '#otherInput'
        ];

        console.log('Checking for missing DOM elements:');
        for (const selector of elementsToCheck) {
            const exists = await page.locator(selector).count();
            const element = await page.locator(selector).first();
            const visible = exists > 0 ? await element.isVisible() : false;
            console.log(`${selector}: exists=${exists > 0}, visible=${visible}`);
        }

        // Check if these elements are created dynamically
        console.log('\nChecking creator type structure in DOM:');
        const creatorTypeList = await page.locator('#creatorTypeList').count();
        const creatorTypeSelector = await page.locator('.creator-type-selector').count();
        console.log(`#creatorTypeList exists: ${creatorTypeList > 0}`);
        console.log(`#.creator-type-selector exists: ${creatorTypeSelector > 0}`);

        // The issue might be that the hierarchical creator type selector HTML elements
        // don't exist in the current DOM, but the JavaScript is trying to attach listeners to them
        const currentHTML = await page.locator('body').innerHTML();
        const hasNavBack = currentHTML.includes('id="navBack"');
        const hasOtherText = currentHTML.includes('id="otherText"');
        console.log(`HTML contains navBack: ${hasNavBack}`);
        console.log(`HTML contains otherText: ${hasOtherText}`);
    });
});