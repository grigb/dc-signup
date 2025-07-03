const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:4100');
  
  // Wait for the page to load
  await page.waitForTimeout(2000);
  
  // Check the actual DOM structure
  const domInfo = await page.evaluate(() => {
    const confirmStep = document.getElementById('confirmationStep');
    const editBtn = document.getElementById('editBtn');
    
    // Get all elements with class submit-btn
    const allSubmitBtns = Array.from(document.querySelectorAll('.submit-btn')).map(btn => ({
      id: btn.id,
      text: btn.textContent.trim(),
      onclick: btn.getAttribute('onclick'),
      parentId: btn.parentElement ? btn.parentElement.id : null,
      isVisible: btn.offsetParent \!== null
    }));
    
    return {
      confirmStepHTML: confirmStep ? confirmStep.outerHTML.substring(0, 500) : 'Not found',
      editBtnFound: \!\!editBtn,
      allSubmitButtons: allSubmitBtns
    };
  });
  
  console.log('DOM Info:', JSON.stringify(domInfo, null, 2));
  
  await browser.close();
})();
