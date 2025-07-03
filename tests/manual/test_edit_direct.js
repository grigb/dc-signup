const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:4100');
  
  // Wait for the page to load
  await page.waitForTimeout(2000);
  
  // Fill out the form
  await page.fill('#name', 'Test Edit Flow');
  await page.fill('#email', 'test@example.com');
  
  // Click Review Submission
  await page.click('button:has-text("Review Submission")');
  await page.waitForTimeout(1000);
  
  // Check if handleEditDetails exists
  const functionExists = await page.evaluate(() => {
    return typeof handleEditDetails !== 'undefined';
  });
  console.log('handleEditDetails function exists:', functionExists);
  
  // Try calling the function directly
  console.log('Calling handleEditDetails directly:');
  await page.evaluate(() => {
    if (typeof handleEditDetails === 'function') {
      handleEditDetails();
    } else {
      console.log('handleEditDetails is not a function');
    }
  });
  
  await page.waitForTimeout(2000);
  
  // Check display states
  const states = await page.evaluate(() => {
    return {
      formDisplay: document.getElementById('signupForm').style.display,
      confirmDisplay: document.getElementById('confirmationStep').style.display,
      confirmVisibility: document.getElementById('confirmationStep').style.visibility,
      confirmZIndex: document.getElementById('confirmationStep').style.zIndex
    };
  });
  console.log('After calling handleEditDetails:', states);
  
  await browser.close();
})();
