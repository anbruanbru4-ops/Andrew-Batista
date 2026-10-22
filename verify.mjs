import {chromium} from 'playwright';
import {mkdir, writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const content=JSON.parse(await readFile('src/content.json','utf8'));

await mkdir('test-results', {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader']});
const page = await browser.newPage({viewport: {width: 1440, height: 1000}, deviceScaleFactor: 1});
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const base=process.env.TEST_URL || 'http://127.0.0.1:4173';
await page.goto(base, {waitUntil: 'networkidle'});
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);
await page.screenshot({path: 'test-results/desktop-hero.png'});
assert.equal(await page.locator('.hero-art').evaluate((e) => e.classList.contains('webgl-ready')), true, 'WebGL renders the 3D core');
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No desktop horizontal overflow');
await page.locator('[data-service="conversations"]').click();
await page.waitForTimeout(650);
assert.equal(await page.locator('#service-dialog').evaluate((e) => e.open), true);
await page.locator('#service-dialog .dialog-close').click();
await page.waitForTimeout(650);
assert.equal(await page.locator('#service-dialog').evaluate((e) => e.open), false);
await page.locator('#tab-1').click();
await page.waitForTimeout(600);
assert.equal(await page.locator('#step-label').textContent(), '02 — EL CONTEXTO CONECTADO');
await page.locator('#tab-1').press('ArrowRight');
await page.waitForTimeout(600);
assert.equal(await page.locator('#tab-2').getAttribute('aria-selected'), 'true');
assert.equal(await page.locator('#system-panel').getAttribute('aria-labelledby'), 'tab-2');
await page.locator('.nav-cta').click();
await page.getByLabel('Nombre del solicitante', {exact: true}).fill('Prueba local');
await page.getByLabel('Nombre de la empresa', {exact: true}).fill('Prueba Veliux');
await page.getByLabel('Industria / Sector', {exact: true}).fill('Prueba');
await page.getByLabel('WhatsApp directo', {exact: true}).fill('0000000000');
await page.getByLabel('Su cuello de botella actual', {exact: true}).fill('Verificar sin enviar mensajes.');
// Intercept before navigation: no real WhatsApp request or message is sent.
await page.evaluate(()=>{window.open=(url)=>{window.__testWhatsApp=url;return null;};});
await page.getByRole('button', {name: 'Continuar en WhatsApp'}).click();
const whatsapp=new URL(await page.evaluate(()=>window.__testWhatsApp));
assert.equal(whatsapp.origin+whatsapp.pathname,'https://wa.me/18296168651');
assert.match(whatsapp.searchParams.get('text'),/Prueba Veliux/);
assert.match(whatsapp.searchParams.get('text'),/Verificar sin enviar mensajes/);
await page.keyboard.press('Escape');
assert.equal(await page.locator('#contact-dialog').evaluate((e) => e.open), false);
// Check all original services, prices, reviews and FAQ answers survived migration.
assert.equal(await page.locator('.catalog-card').count(),10);
for(const service of content.services){
  const card=page.locator('.catalog-card').filter({has:page.getByRole('heading',{name:service.name,exact:true})});
  assert.equal(await card.locator('p').textContent(),service.description);
  assert.equal(await card.locator('.price strong').textContent(),service.price?'$'+service.price.toLocaleString('en-US'):'SIN COSTO');
}
await page.getByRole('button',{name:'Web High-Ticket',exact:true}).click();
assert.equal(await page.locator('.catalog-card:visible').count(),2);
await page.getByRole('button',{name:'Todos',exact:true}).click();
assert.equal(await page.locator('.catalog-card:visible').count(),10);
await page.locator('.catalog-card').filter({has:page.getByRole('heading',{name:'Agente Conversacional de Ventas 24/7',exact:true})}).getByRole('button').click();
assert.equal(await page.locator('select[name=service]').inputValue(),'agente-ventas');
await page.keyboard.press('Escape');
for(let i=0;i<content.industries.length;i++){
  await page.locator(`#industry-tab-${i}`).click();
  assert.equal(await page.locator('#industry-problem').textContent(),content.industries[i].bottleneck);
  assert.deepEqual(await page.locator('#industry-flow li').allTextContents(),content.industries[i].flow);
}
await page.locator('#industry-tab-6').press('Home');
assert.equal(await page.locator('#industry-tab-0').getAttribute('aria-selected'),'true');
await page.locator('#industry-contact').click();
assert.equal(await page.locator('input[name=industry]').inputValue(),'Veterinarias');
await page.keyboard.press('Escape');
await page.locator('#demo-web').click();
assert.equal(await page.locator('#demo-panel-web').isVisible(),true);
for(let i=0;i<content.showcase.length;i++){
  await page.locator(`[data-showcase="${i}"]`).click();
  assert.equal(await page.locator('#showcase-title').textContent(),content.showcase[i].name);
}
await page.locator('#demo-web').press('ArrowLeft');
assert.equal(await page.locator('#demo-panel-wa').isVisible(),true);
assert.equal(await page.locator('.message').count(),7);
assert.match(await page.locator('#loss-value').textContent(),/7,344/);
assert.match(await page.locator('#recovery-value').textContent(),/5,288/);
await page.locator('#response-time').selectOption('0.18');
assert.match(await page.locator('#loss-value').textContent(),/3,888/);
for(let i=0;i<content.reviews.length;i++)assert.equal(await page.locator('.review-card blockquote').nth(i).textContent(),`“${content.reviews[i].text}”`);
for(let i=0;i<content.faq.length;i++)assert.equal(await page.locator('.faq-list details p').nth(i).textContent(),content.faq[i].a);
await page.locator('.faq-list summary').nth(1).click();
assert.equal(await page.locator('.faq-list details').nth(1).getAttribute('open'),'');
// Every internal link has a real destination; no broken placeholder routes.
assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href')).filter(h=>h.length>1&&!document.getElementById(h.slice(1)))),[]);
// Reveal the whole layout for a full-page visual review.
await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible')));
await page.waitForTimeout(900);
await page.screenshot({path: 'test-results/desktop-full.png', fullPage: true});
await page.setViewportSize({width: 390, height: 844});
await page.goto(base, {waitUntil: 'networkidle'});
await page.waitForTimeout(900);
await page.screenshot({path: 'test-results/mobile-hero.png'});
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No mobile horizontal overflow');
await page.locator('.menu-toggle').click();
assert.equal(await page.locator('#mobile-nav').isVisible(), true);
await page.locator('#mobile-nav a').first().click();
assert.equal(await page.locator('#mobile-nav').isVisible(), false);
await page.locator('[data-service="systems"]').click();
await page.waitForTimeout(650);
await page.screenshot({path: 'test-results/mobile-detail.png'});
await page.keyboard.press('Escape');
await page.waitForTimeout(650);
await page.locator('#industry-tab-3').click();
assert.match(await page.locator('#industry-problem').textContent(),/Pedidos telefónicos/);
await page.locator('.catalog-card').last().getByRole('button').click();
assert.equal(await page.locator('#contact-dialog').evaluate(e=>e.open),true);
assert.equal(await page.locator('#contact-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth),true);
await page.keyboard.press('Escape');
for(const width of [320,768,1024]){
  await page.setViewportSize({width,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`No overflow at ${width}px`);
}
await page.emulateMedia({reducedMotion: 'reduce'});
await page.reload({waitUntil: 'networkidle'});
assert.equal(await page.locator('html').evaluate((e) => e.classList.contains('js-motion')), false);
await page.locator('#tab-2').click();
assert.equal(await page.locator('#step-label').textContent(), '03 — EL SIGUIENTE PASO');
assert.deepEqual(errors, [], 'No uncaught browser errors');
await writeFile('test-results/results.json', JSON.stringify({passed: ['WebGL 3D','Responsive at 320, 390, 768, 1024, 1440','Shared-element dialog','Keyboard tabs and crossfade','WhatsApp URL generation intercepted locally','Service and industry form prefill','Ten source services and exact prices','Category filters','Seven industry flows','Four showcase examples','Seven demo messages','Calculator arithmetic','Fifteen complete source reviews','Four source FAQ answers','Internal links','Mobile menu and dialogs','Reduced motion'],browserErrors:errors},null,2));
console.log('PASS: content parity, desktop/mobile, 3D, filters, industries, demos, calculator, WhatsApp generation, keyboard and reduced motion.');
await browser.close();
