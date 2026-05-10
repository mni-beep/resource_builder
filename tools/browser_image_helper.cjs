#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('playwright');

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9'
};

const RANKING_STOP_WORDS = new Set([
  'about', 'assets', 'article', 'earth', 'featured', 'from', 'gallery', 'home', 'image', 'images', 'landing',
  'latest', 'nasa', 'news', 'page', 'science', 'share', 'story', 'this', 'thumbnail', 'with', 'www'
]);

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function parseArgs(argv) {
  const args = { waitMs: 2500, mode: null, url: null, out: null };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const part = argv[index];
    if (part === '--wait' && argv[index + 1]) {
      args.waitMs = Number(argv[index + 1]);
      index += 1;
      continue;
    }
    if (part === '--selector' && argv[index + 1]) {
      args.selector = argv[index + 1];
      index += 1;
      continue;
    }
    if (part === '--match' && argv[index + 1]) {
      args.match = argv[index + 1].toLowerCase();
      index += 1;
      continue;
    }
    positional.push(part);
  }

  [args.mode, args.url, args.out] = positional;
  return args;
}

function usage() {
  console.error('Usage:');
  console.error('  node tools/browser_image_helper.cjs extract <page_url>');
  console.error('  node tools/browser_image_helper.cjs download <page_url> <output_path> [--match text] [--wait ms]');
  console.error('  node tools/browser_image_helper.cjs screenshot <page_url> <output_path> [--selector css] [--wait ms]');
}

function preferredTermsFor(pageUrl) {
  const url = (pageUrl || '').toLowerCase();
  if (url.includes('pixabay.com')) {
    return ['cdn.pixabay.com'];
  }
  if (url.includes('openstax.org')) {
    return ['openstax.org/apps/image-cdn', 'assets.openstax.org'];
  }
  if (url.includes('nasa.gov') || url.includes('earthobservatory.nasa.gov') || url.includes('science.nasa.gov')) {
    return [
      'assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/',
      'assets.science.nasa.gov/dynamicimage/assets/science/esd/',
      'eoimages.gsfc.nasa.gov',
      'images-assets.nasa.gov/image/'
    ];
  }
  return [];
}

function tokenizeRankingText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[%_./-]+/g, ' ')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !RANKING_STOP_WORDS.has(token));
}

function extractRankingKeywords(referenceUrl, pageTitle) {
  const segments = [];
  try {
    const parsed = new URL(referenceUrl);
    segments.push(parsed.hostname, parsed.pathname);
  } catch (error) {
    segments.push(referenceUrl || '');
  }
  segments.push(pageTitle || '');

  const keywords = [];
  for (const token of tokenizeRankingText(segments.join(' '))) {
    if (!keywords.includes(token)) {
      keywords.push(token);
    }
  }
  return keywords.slice(0, 12);
}

function candidateText(candidate) {
  return [
    candidate.src,
    candidate.alt,
    candidate.caption,
    candidate.contextText,
    candidate.linkHref,
    candidate.className
  ].filter(Boolean).join(' ').toLowerCase();
}

function pickBestCandidate(candidates, matchText, referenceUrl, pageTitle) {
  const blockedTerms = ['logo', 'icon', 'avatar', 'flag', 'wordmark', 'sprite', 'favicon', 'placeholder', 'blank.gif'];
  const pool = candidates.filter((candidate) => {
    const haystack = candidateText(candidate);
    return !blockedTerms.some((term) => haystack.includes(term));
  });

  if (!pool.length) {
    return candidates[0] || null;
  }

  const preferredTerms = preferredTermsFor(referenceUrl);
  const keywords = extractRankingKeywords(referenceUrl, pageTitle);

  const scored = pool.map((candidate) => {
    const haystack = candidateText(candidate);
    const keywordHits = keywords.filter((keyword) => haystack.includes(keyword));
    let score = candidate.area || 0;

    if (preferredTerms.some((term) => haystack.includes(term))) {
      score += 250000;
    }
    if (matchText && haystack.includes(matchText)) {
      score += 300000;
    }
    score += keywordHits.length * 85000;
    if (candidate.alt && keywordHits.length) {
      score += 40000;
    }
    if (candidate.caption && keywordHits.length) {
      score += 80000;
    }
    if (candidate.contextText && keywordHits.length >= 2) {
      score += 50000;
    }
    if (!candidate.alt) {
      score -= 10000;
    }
    if (!candidate.caption && !candidate.contextText) {
      score -= 5000;
    }
    if (/(thumbnail|thumb|teaser|tile|card)/.test(haystack)) {
      score -= 15000;
    }
    if (candidate.top >= 0 && candidate.top <= 1400) {
      score += 25000;
    }
    if (candidate.top > 3200) {
      score -= 30000;
    }

    return { ...candidate, keywordHits, score };
  });

  scored.sort((left, right) => right.score - left.score || right.area - left.area || left.top - right.top);
  return scored[0] || candidates[0] || null;
}

async function collectCandidates(page) {
  return page.evaluate(() => {
    const visible = (element) => {
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
        return false;
      }
      const rect = element.getBoundingClientRect();
      return rect.width >= 120 && rect.height >= 80 && rect.bottom > 0 && rect.right > 0;
    };

    const items = [];
    for (const element of document.querySelectorAll('img, picture img, canvas, svg, video, figure img')) {
      if (!visible(element)) {
        continue;
      }

      const rect = element.getBoundingClientRect();
      const tag = element.tagName.toLowerCase();
      const figure = element.closest('figure, article, section, [class*="card"], [class*="item"]');
      const caption = figure?.querySelector('figcaption')?.textContent || '';
      const contextText = (figure?.textContent || element.parentElement?.textContent || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 300);
      const linkHref = element.closest('a')?.href || '';
      const classNames = [
        typeof element.className === 'string' ? element.className : '',
        figure && typeof figure.className === 'string' ? figure.className : ''
      ].filter(Boolean).join(' ');
      const src = tag === 'img' ? (element.currentSrc || element.src || '') : '';

      items.push({
        tag,
        src,
        alt: element.getAttribute('alt') || '',
        caption: caption.replace(/\s+/g, ' ').trim().slice(0, 180),
        contextText,
        linkHref,
        className: classNames,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        area: Math.round(rect.width * rect.height),
        top: Math.round(rect.top),
        left: Math.round(rect.left)
      });
    }

    items.sort((left, right) => right.area - left.area);
    return items.slice(0, 25);
  });
}

function validateDownload(contentType, buffer) {
  // Reject HTML/text responses
  if (contentType.includes('html') || contentType.startsWith('text/')) {
    throw new Error(`not an image: ${contentType || 'unknown content type'}`);
  }
  const trimmed = buffer.subarray(0, Math.min(buffer.length, 200)).toString('utf8').trimStart().toLowerCase();
  if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.startsWith('<body')) {
    throw new Error('not an image: response body is HTML');
  }
  // Verify magic bytes for common image formats
  const head = buffer.subarray(0, 12);
  const isPNG  = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47;
  const isJPEG = head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF;
  const isWEBP = head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46
              && head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50;
  const isGIF  = head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x38;
  const isSVG  = trimmed.startsWith('<svg') || trimmed.startsWith('<?xml');
  if (!isPNG && !isJPEG && !isWEBP && !isGIF && !isSVG) {
    throw new Error('not a recognised image format (expected PNG/JPEG/WEBP/GIF/SVG)');
  }
}

async function saveDownloadedFile(context, url, outPath, referer) {
  const headers = {
    ...BROWSER_HEADERS,
    ...(referer ? { Referer: referer } : {})
  };

  if (url.includes('cdn.pixabay.com')) {
    const curlBin = process.platform === 'win32' ? 'curl.exe' : 'curl';
    const curlResult = spawnSync(curlBin, [
      '-L',
      '--fail',
      '-sS',
      '-A',
      BROWSER_HEADERS['User-Agent'],
      ...(referer ? ['-H', `Referer: ${referer}`] : []),
      '-o',
      outPath,
      url
    ], { encoding: 'utf8' });

    if (curlResult.status === 0 && fs.existsSync(outPath)) {
      const buffer = fs.readFileSync(outPath);
      validateDownload('image/unknown', buffer);
      return { bytes: buffer.length, contentType: 'image/unknown' };
    }
  }

  ensureDir(outPath);

  try {
    const response = await context.request.get(url, { headers });
    if (!response.ok()) {
      throw new Error(`download failed: ${response.status()} ${response.statusText()}`);
    }
    const contentType = (response.headers()['content-type'] || '').toLowerCase();
    const buffer = Buffer.from(await response.body());
    validateDownload(contentType, buffer);
    fs.writeFileSync(outPath, buffer);
    return { bytes: buffer.length, contentType };
  } catch (requestError) {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw requestError;
    }
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const buffer = Buffer.from(await response.arrayBuffer());
    validateDownload(contentType, buffer);
    fs.writeFileSync(outPath, buffer);
    return { bytes: buffer.length, contentType };
  }
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.mode || !args.url || !['extract', 'download', 'screenshot'].includes(args.mode)) {
    usage();
    process.exit(1);
  }

  if ((args.mode === 'download' || args.mode === 'screenshot') && !args.out) {
    usage();
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  let context, page;

  try {
    context = await browser.newContext({
      viewport: { width: 1600, height: 1100 },
      locale: 'en-US',
      userAgent: BROWSER_HEADERS['User-Agent']
    });

    page = await context.newPage();
    await page.goto(args.url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    try {
      await page.waitForLoadState('networkidle', { timeout: 8000 });
    } catch (error) {
      // JS-heavy sites often keep background requests alive; continue with the explicit wait below.
    }

    await page.waitForTimeout(args.waitMs);

    const pageTitle = await page.title();
    const candidates = await collectCandidates(page);

    if (args.mode === 'extract') {
      console.log(JSON.stringify({ requestedUrl: args.url, url: page.url(), title: pageTitle, candidates }, null, 2));
      return;
    }

    if (args.mode === 'download') {
      const candidate = pickBestCandidate(candidates.filter((item) => item.src), args.match, args.url, pageTitle);
    if (!candidate || !candidate.src) {
      throw new Error('no downloadable image candidate found after rendering');
    }
    const result = await saveDownloadedFile(context, candidate.src, args.out, page.url());
    console.log(JSON.stringify({
      mode: 'download',
      requestedUrl: args.url,
      pageUrl: page.url(),
      title: pageTitle,
      candidate,
      bytes: result.bytes,
      contentType: result.contentType,
      output: args.out
    }, null, 2));
    return;
  }

  let locator = null;
  if (args.selector) {
    locator = page.locator(args.selector).first();
  } else {
    const selectors = [
      'canvas',
      'svg',
      'img',
      'figure img',
      'main canvas',
      'main svg',
      'main img'
    ];
    for (const selector of selectors) {
      const current = page.locator(selector).filter({ hasNotText: 'logo' }).first();
      if (await current.count()) {
        const box = await current.boundingBox();
        if (box && box.width >= 120 && box.height >= 80) {
          locator = current;
          break;
        }
      }
    }
  }

  ensureDir(args.out);
  if (locator) {
    await locator.screenshot({ path: args.out });
  } else {
    await page.screenshot({ path: args.out, fullPage: false });
  }

  console.log(JSON.stringify({
    mode: 'screenshot',
    pageUrl: page.url(),
    title: pageTitle,
    output: args.out,
    selector: args.selector || null
  }, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(2);
});