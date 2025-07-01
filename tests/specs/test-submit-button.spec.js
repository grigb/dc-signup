const { test, expect } = require('@playwright/test');

test('Debug submit button functionality', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  // No need for custom HTTP server; Playwright webServer provided in config.
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404);
          res.end('File not found');
        } else {
          res.writeHead(500);
          res.end('Server error: ' + error.code);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
  


  try {
    // Navigate using Playwright baseURL
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    console.log('=== PAGE LOADED ===');
    
    // Fill in the form
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    
    console.log('=== FORM FILLED ===');
    
    // Select a creator type by clicking the modal div and selecting an option
    console.log('=== SELECTING CREATOR TYPE ===');
    const creatorTypeBtn = await page.locator('.simple-creator-input[onclick="openCreatorTypeModal()"]');
    await creatorTypeBtn.click();
    
    // Wait for modal to open
    await page.waitForTimeout(1000);
    
    // Check if modal is visible
    const modalVisible = await page.locator('#creatorTypeModal').isVisible();
    console.log('Creator type modal visible:', modalVisible);
    
    if (modalVisible) {
        // Click on the first creator type category
        const firstCategory = await page.locator('.creator-category .category-header').first();
        await firstCategory.click();
        
        // Save selection
        const saveBtn = await page.locator('button[onclick="saveCreatorTypes()"]');
        await saveBtn.click();
        
        console.log('Creator type selected and saved');
    }
    
    console.log('=== CREATOR TYPE SELECTION COMPLETE ===');
    
    // Check if submit button exists
    const submitButton = await page.locator('#submitBtn');
    const isVisible = await submitButton.isVisible();
    console.log('Submit button visible:', isVisible);
    
    // Check button text
    const buttonText = await submitButton.textContent();
    console.log('Button text:', buttonText);
    
    // Check if the function exists
    const handleFormSubmitExists = await page.evaluate(() => {
      return typeof window.handleFormSubmit === 'function';
    });
    console.log('handleFormSubmit function exists:', handleFormSubmitExists);
    
    // Check if form exists
    const formExists = await page.evaluate(() => {
      return !!document.getElementById('signupForm');
    });
    console.log('Form exists:', formExists);
    
    // Try clicking the button and capture any errors
    console.log('=== CLICKING SUBMIT BUTTON ===');
    await submitButton.click();
    
    // Wait a moment to see what happens
    await page.waitForTimeout(2000);
    
    // Check if any error messages appeared
    const errorMessage = await page.locator('#errorMessage').textContent();
    console.log('Error message:', errorMessage);
    
    // Check if confirmation step appeared
    const confirmationVisible = await page.locator('#confirmationStep').isVisible();
    console.log('Confirmation step visible:', confirmationVisible);
    
  // nothing to close
});