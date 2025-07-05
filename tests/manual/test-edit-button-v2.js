const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  await page.goto('http://localhost:4100/');
  
  // Check if handleEditDetails exists
  const functionExists = await page.evaluate(() => {
    return typeof handleEditDetails;
  });
  
  console.log('typeof handleEditDetails:', functionExists);
  
  // Fill form
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  
  // Select creator type - use more specific selector
  await page.click('.creator-selector');
  await page.waitForSelector('.creator-modal', { state: 'visible' });
  
  // Find and click Music in the modal
  await page.click('.creator-option:has-text("Music")');
  await page.click('button:has-text("Save Selection")');
  
  // Go to review
  await page.click('button:has-text("Review Submission")');
  
  // Wait for confirmation step
  await page.waitForSelector('#confirmationStep', { state: 'visible' });
  
  console.log('\nConfirmation step visible. Looking for Edit Details button...');
  
  // Check if Edit Details button exists
  const buttonExists = await page.locator('button:has-text("Edit Details")').count();
  console.log('Edit Details button found:', buttonExists > 0);
  
  // Get the onclick attribute
  const onclickAttr = await page.locator('button:has-text("Edit Details")').getAttribute('onclick');
  console.log('Button onclick attribute:', onclickAttr);
  
  // Clear console messages before clicking
  consoleMessages.length = 0;
  
  // Try clicking the button
  console.log('\nClicking Edit Details button...');
  await page.locator('button:has-text("Edit Details")').click();
  
  // Wait a bit for any console messages
  await page.waitForTimeout(1000);
  
  console.log('\nConsole messages after click:');
  consoleMessages.forEach(msg => console.log(msg));
  
  // Check if confirmation step is still visible
  const confirmStillVisible = await page.locator('#confirmationStep').isVisible();
  console.log('\nConfirmation step still visible?', confirmStillVisible);
  
  // Check if form is visible
  const formVisible = await page.locator('#signupForm').isVisible();
  console.log('Form visible?', formVisible);
  
  await page.waitForTimeout(2000);
  await browser.close();
})();