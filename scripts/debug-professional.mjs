// Dump raw PDF text around questions 5 and 6 in professional bank
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUESTION_DIR = path.join(__dirname, '..', 'public', 'question');

async function main() {
  const file = fs.readdirSync(QUESTION_DIR).find(f => /專業操作證學科測驗題庫(?!.*屆期)/.test(f) && f.endsWith('.pdf'));
  const buf = fs.readFileSync(path.join(QUESTION_DIR, file));
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  const text = result.text;

  // Find "5." and show surrounding context
  const idx5 = text.search(/^5\.\s/m);
  if (idx5 !== -1) {
    console.log('=== Around Q5 (professional) ===');
    console.log(JSON.stringify(text.substring(idx5 - 50, idx5 + 500)));
  }

  // Also check how many times a line starts with a bare number+period matching question pattern
  const matches = [...text.matchAll(/^(\d+)\.\s+[^\n]+/mg)];
  console.log('\n=== First 20 "N. text" line matches ===');
  for (const m of matches.slice(0, 20)) {
    console.log(`num=${m[1]}: ${m[0].substring(0, 80)}`);
  }

  // Check what's between question block 5 and 6
  const idx6 = text.search(/^6\.\s/m);
  if (idx5 !== -1 && idx6 !== -1) {
    console.log('\n=== Between Q5 start and Q6 start ===');
    console.log(JSON.stringify(text.substring(idx5, idx6 + 200)));
  }

  await parser.destroy();
}
main();
