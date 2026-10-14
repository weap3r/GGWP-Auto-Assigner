let isRunning = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start' && !isRunning) {
    isRunning = true;
    startLoop();
  } else if (request.action === 'stop') {
    isRunning = false;
    console.log('%c[Auto] Loop stopped by user.', 'color: red;');
  }
});

async function waitForElement(selector, timeout = 5000, exactText = null) {
  const start = Date.now();
  while (Date.now() - start < timeout && isRunning) {
    if (exactText) {
      const elements = document.querySelectorAll('*');
      for (let el of elements) {
        if (el.textContent?.trim() === exactText && el.children.length === 0) return el;
      }
      for (let el of elements) {
        if (el.innerText?.trim() === exactText) return el;
      }
    } else {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  return null;
}

async function startLoop() {
  let round = 0;
  console.log('%c[Auto] Repeated actions active.', 'color: green;');

  while (isRunning) {
    round++;

    // 1. Check toggle state explicitly
    const toggle = await waitForElement('.RepToggleButton.Debossed', 3000);
    if (toggle && isRunning) {
      if (toggle.classList.contains('ToggleButtonOn')) {
        toggle.click();
      } else if (toggle.classList.contains('ToggleButtonOff')) {
        toggle.click();
        await sleep(200);
        toggle.click();
      }
    }

    await sleep(2000);

    // 2. Unchecked checkbox
    const unchecked = await waitForElement('.RepCheckboxBox.RepCheckboxUnchecked', 3000);
    if (unchecked && isRunning) {
      unchecked.click();
    }

    await sleep(2000);

    // 3. Assign moderator & Assign to me
    const assignModerator = await waitForElement(null, 3000, 'Assign moderator');
    if (assignModerator && isRunning) {
      assignModerator.click();
      await sleep(500);
     
      const assignToMe = await waitForElement(null, 3000, 'Assign to me');
      if (assignToMe && isRunning) {
        assignToMe.click();
      }
    }

    console.log(`[Auto] Completed loop cycle ${round}.`);
    await sleep(2000);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
