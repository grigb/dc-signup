const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4100/');
  
  // Check if handleEditDetails exists
  const functionExists = await page.evaluate(() => {
    return typeof handleEditDetails;
  });
  
  console.log('typeof handleEditDetails:', functionExists);
  
  // Check if it's a function
  const isFunction = await page.evaluate(() => {
    return typeof handleEditDetails === 'function';
  });
  
  console.log('Is handleEditDetails a function?', isFunction);
  
  // Fill form quickly
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  
  // Select creator type
  await page.click('text=Click to select your creator types');
  await page.click('text=Music');
  await page.click('button:has-text("Save Selection")');
  
  // Go to review
  await page.click('button:has-text("Review Submission")');
  
  // Wait for confirmation step
  await page.waitForSelector('#confirmationStep', { state: 'visible' });
  
  // Try to click Edit Details button
  console.log('\nClicking Edit Details button...');
  await page.click('button:has-text("Edit Details")');
  
  // Check console messages
  const messages = [];
  page.on('console', msg => messages.push(msg.text()));
  
  // Try calling handleEditDetails directly
  const result = await page.evaluate(() => {
    if (typeof handleEditDetails === 'function') {
      handleEditDetails();
      return 'Function called';
    }
    return 'Function not found';
  });
  
  console.log('Direct call result:', result);
  console.log('Console messages:', messages);
  
  await page.waitForTimeout(2000);
  await browser.close();
})();