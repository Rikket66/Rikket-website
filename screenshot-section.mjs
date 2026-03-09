import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || 'section';
const scrollY = parseInt(process.argv[4] || '0');
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
const nums = existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] || '0')).filter(n => !isNaN(n));
const next = (nums.length ? Math.max(...nums) : 0) + 1;
const outPath = path.join(dir, `screenshot-${next}-${label}.png`);
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page    = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
// trigger all animations
const totalHeight = await page.evaluate(() => document.body.scrollHeight);
let s = 0;
while (s < totalHeight) { s = Math.min(s + 600, totalHeight); await page.evaluate(y => window.scrollTo(0, y), s); await new Promise(r => setTimeout(r, 80)); }
await page.evaluate(y => window.scrollTo(0, y), scrollY);
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: outPath });
await browser.close();
console.log(`Saved: temporary screenshots/screenshot-${next}-${label}.png`);
