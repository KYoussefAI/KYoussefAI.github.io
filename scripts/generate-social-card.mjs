import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

// Generate the share image from editable HTML/CSS. No image-generation service required.
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#111413;color:#eceee7;font-family:Arial,sans-serif;padding:65px 75px;position:relative}
    .top{display:flex;align-items:center;gap:28px;border-bottom:1px solid #35402f;padding-bottom:25px}.logo{font-size:38px;font-weight:bold;letter-spacing:-4px}.name{font:13px monospace;letter-spacing:2px;color:#b6cca7}
    h1{font-size:65px;font-weight:500;line-height:1.14;letter-spacing:-3px;margin:45px 0 25px}h1 span{color:#a0aa9e}.accent{color:#b6cca7}p{font-size:19px;color:#a0a89f}.bottom{position:absolute;left:75px;right:75px;bottom:45px;display:flex;justify-content:space-between;color:#b6cca7;font:12px monospace;border-top:1px solid #35402f;padding-top:24px}
  </style></head><body><div class="top"><span class="logo">yk<span class="accent">.</span></span><span class="name">YOUSSEF KHALOUFI</span></div><h1>Data Engineering<br><span>& Distributed Systems</span><span class="accent">.</span></h1><p>Learning by building. From raw data to analytical understanding.</p><div class="bottom"><span>TANGIER, MOROCCO</span><span>kyoussefai.github.io</span></div></body></html>`);
  await mkdir('public/images', { recursive: true });
  await page.screenshot({ path: 'public/images/social-card.png' });
} finally { await browser.close(); }
