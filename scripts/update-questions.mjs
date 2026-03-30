/**
 * Update Question Banks
 *
 * Downloads PDFs from CAA website and re-parses them.
 * Used by GitHub Actions workflow for weekly auto-updates.
 *
 * Usage: node scripts/update-questions.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const QUESTION_DIR = path.join(ROOT, 'public', 'question');

const CAA_BASE_URL = 'https://www.caa.gov.tw';
const CAA_PAGE_URL = `${CAA_BASE_URL}/Article.aspx?a=3833&lang=1`;

/**
 * Which PDF files we want (matched against the `title` attribute of the anchor tag).
 * Exclude 簡易 (simplified) and English versions.
 */
const BANK_MATCHERS = [
  { label: '普通操作證',   pattern: /普通操作證學科測驗題庫/ },
  { label: '專業操作證',   pattern: /專業操作證學科測驗題庫(?!.*屆期)/ },
  { label: '屆期換證',     pattern: /屆期換證學科測驗題庫(?!.*簡易)/ },
];

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; drone-pilot-quiz-bot/1.0)',
      'Accept-Language': 'zh-TW,zh;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

/**
 * Extract decoded filename from Content-Disposition header.
 * CAA server sends filenames as Big5, transmitted as Latin-1 bytes.
 */
function getFilenameFromContentDisposition(header) {
  if (!header) return null;
  const match = header.match(/filename=([^\s;]+)/i);
  if (!match) return null;
  try {
    // Header bytes are Big5 re-interpreted as Latin-1 — decode back to Unicode
    const bytes = Buffer.from(match[1], 'latin1');
    const decoded = new TextDecoder('big5').decode(bytes);
    // Sanity check: must end in .pdf and contain CJK characters
    if (decoded.endsWith('.pdf') && /[\u4e00-\u9fff]/.test(decoded)) return decoded;
  } catch {
    // fall through to null
  }
  return null;
}

async function downloadFile(url, destDir, titleFallback) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; drone-pilot-quiz-bot/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${url}`);

  // Prefer server-supplied filename (properly decoded from Big5)
  const cdFilename = getFilenameFromContentDisposition(res.headers.get('content-disposition'));
  const fileName = cdFilename ?? titleFallback.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');

  const buffer = Buffer.from(await res.arrayBuffer());
  const destPath = path.join(destDir, fileName);
  fs.writeFileSync(destPath, buffer);
  console.log(`  ✓ ${fileName} (${(buffer.length / 1024).toFixed(0)} KB)`);
  return fileName;
}

async function main() {
  console.log('Fetching CAA page...');
  const html = await fetchPage(CAA_PAGE_URL);

  // Each download link looks like:
  //   <a href="../FileAtt.ashx?lang=1&id=39917" ... title="普通操作證學科測驗題庫【115.pdf">
  // The `title` attribute contains the filename including extension (.pdf / .docx / .odt).
  // We want only the .pdf links that match our bank patterns.
  const linkRegex = /href="(\.\.\/FileAtt\.ashx\?[^"]+)"[^>]*title="([^"]+\.pdf)"/gi;
  const pdfLinks = [];
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    pdfLinks.push({ href: m[1], title: m[2] });
  }

  console.log(`Found ${pdfLinks.length} PDF download link(s)`);
  if (pdfLinks.length === 0) {
    console.error('✗ No PDF links found. The CAA page may have changed structure.');
    process.exit(1);
  }

  if (!fs.existsSync(QUESTION_DIR)) {
    fs.mkdirSync(QUESTION_DIR, { recursive: true });
  }

  let downloaded = 0;
  for (const bank of BANK_MATCHERS) {
    const link = pdfLinks.find((l) => bank.pattern.test(l.title));
    if (!link) {
      console.warn(`⚠  No PDF found for ${bank.label}`);
      continue;
    }

    // href is like "../FileAtt.ashx?lang=1&id=39917" — resolve against base URL
    const downloadUrl = new URL(link.href, CAA_BASE_URL + '/subpage/').href;

    console.log(`\nDownloading: ${bank.label}`);
    console.log(`  ${link.title}  →  ${downloadUrl}`);

    try {
      // Remove existing files matching the same bank pattern to avoid stale duplicates
      const existing = fs.readdirSync(QUESTION_DIR).filter((f) => bank.pattern.test(f));
      for (const old of existing) {
        fs.unlinkSync(path.join(QUESTION_DIR, old));
        console.log(`  ✗ Removed old: ${old}`);
      }

      await downloadFile(downloadUrl, QUESTION_DIR, link.title.replace(/\.pdf$/i, '') + '.pdf');
      downloaded++;
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  if (downloaded === 0) {
    console.error('\n✗ No files downloaded.');
    process.exit(1);
  }

  // Re-parse all PDFs to regenerate JSON
  console.log('\nParsing downloaded PDFs...');
  execSync('node scripts/parse-pdf.mjs', { cwd: ROOT, stdio: 'inherit' });

  console.log(`\n✓ Update complete. Downloaded ${downloaded} file(s).`);
}

main().catch((err) => {
  console.error('Update failed:', err);
  process.exit(1);
});
