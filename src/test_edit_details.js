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
  
  // Try clicking Edit Details and check what happens
  console.log('Before clicking Edit Details:');
  const formVisible = await page.evaluate(() => {
    return {
      formDisplay: document.getElementById('signupForm').style.display,
      confirmDisplay: document.getElementById('confirmationStep').style.display
    };
  });
  console.log(formVisible);
  
  // Click Edit Details
  await page.click('button:has-text("Edit Details")');
  await page.waitForTimeout(1000);
  
  console.log('After clicking Edit Details:');
  const afterClick = await page.evaluate(() => {
    return {
      formDisplay: document.getElementById('signupForm').style.display,
      confirmDisplay: document.getElementById('confirmationStep').style.display
    };
  });
  console.log(afterClick);
  
  // Test running showFormStep directly
  console.log('Running showFormStep() directly:');
  await page.evaluate(() => {
    showFormStep();
  });
  await page.waitForTimeout(1000);
  
  const afterDirect = await page.evaluate(() => {
    return {
      formDisplay: document.getElementById('signupForm').style.display,
      confirmDisplay: document.getElementById('confirmationStep').style.display
    };
  });
  console.log(afterDirect);
  
  await browser.close();
})();
EOF < /dev/null