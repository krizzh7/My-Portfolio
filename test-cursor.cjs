const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // Listen for console messages
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });

  // Wait for loading screen to finish
  await page.waitForFunction(() => !document.querySelector('.boot-screen') || document.querySelector('.boot-screen').classList.contains('boot-screen-exit'), { timeout: 10000 });

  // Wait a bit more for cursor to initialize
  await page.waitForTimeout(1000);

  // Check cursor state
  const cursorState = await page.evaluate(() => {
    const body = document.body;
    return {
      cursorVisible: body.classList.contains('cursor-visible'),
      cursorHover: body.classList.contains('cursor-hover'),
      cursorPressed: body.classList.contains('cursor-pressed'),
      cursorDragExists: !!document.querySelector('.cursor-drag'),
      cursorInkExists: !!document.querySelector('.cursor-ink'),
      cursorDragStyle: document.querySelector('.cursor-drag')?.style.transform,
      cursorInkStyle: document.querySelector('.cursor-ink')?.style.transform,
    };
  });
  console.log('Initial cursor state:', cursorState);

  // Move to a link and check hover state
  const navLink = await page.$('.nav-links a');
  if (navLink) {
    const box = await navLink.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
      await page.waitForTimeout(200);

      const hoverState = await page.evaluate(() => {
        const body = document.body;
        return {
          cursorHover: body.classList.contains('cursor-hover'),
          cursorDragStyle: document.querySelector('.cursor-drag')?.style.transform,
          cursorInkStyle: document.querySelector('.cursor-ink')?.style.transform,
          dragScale: getComputedStyle(document.querySelector('.cursor-drag')).scale,
          inkScale: getComputedStyle(document.querySelector('.cursor-ink')).scale,
        };
      });
      console.log('Hover state over nav link:', hoverState);
    }
  }

  // Also test over a project link
  const projectLink = await page.$('.project-links a');
  if (projectLink) {
    const box = await projectLink.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
      await page.waitForTimeout(200);

      const hoverState = await page.evaluate(() => {
        const body = document.body;
        return {
          cursorHover: body.classList.contains('cursor-hover'),
          cursorDragStyle: document.querySelector('.cursor-drag')?.style.transform,
          cursorInkStyle: document.querySelector('.cursor-ink')?.style.transform,
          dragScale: getComputedStyle(document.querySelector('.cursor-drag')).scale,
          inkScale: getComputedStyle(document.querySelector('.cursor-ink')).scale,
        };
      });
      console.log('Hover state over project link:', hoverState);
    }
  }

  // Test over regular content (not a link)
  await page.mouse.move(100, 100);
  await page.waitForTimeout(200);

  const normalState = await page.evaluate(() => {
    const body = document.body;
    return {
      cursorHover: body.classList.contains('cursor-hover'),
      cursorDragStyle: document.querySelector('.cursor-drag')?.style.transform,
      cursorInkStyle: document.querySelector('.cursor-ink')?.style.transform,
    };
  });
  console.log('Normal state (over content):', normalState);

  await browser.close();
})();