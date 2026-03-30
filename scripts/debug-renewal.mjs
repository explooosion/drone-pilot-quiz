// Debug renewal parsing: find which question numbers are missing
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUESTION_DIR = path.join(__dirname, '..', 'public', 'question');

function stripPageMarkers(text) {
  return text
    .replace(/--\s*\d+\s*of\s*\d+\s*--\n+\d+\n/g, '\n')
    .replace(/--\s*\d+\s*of\s*\d+\s*--/g, '');
}

async function main() {
  const file = fs.readdirSync(QUESTION_DIR).find(f => /屆期換證/.test(f) && f.endsWith('.pdf'));
  const buf = fs.readFileSync(path.join(QUESTION_DIR, file));
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  const text = result.text;

  const answerMarkerIdx = text.lastIndexOf('答案');
  const questionText = stripPageMarkers(text.substring(0, answerMarkerIdx));

  // New regex
  const newBlocks = questionText.split(/(?=^\d+\.?[ \t]+[\u4e00-\u9fff])/m).filter(b => b.trim());
  // Old regex  
  const oldBlocks = questionText.split(/(?=^\d+\.?\s+[\u4e00-\u9fff(（「])/m).filter(b => b.trim());

  const newNums = new Set();
  for (const b of newBlocks) {
    const m = b.match(/^(\d+)\.?[ \t]+/);
    if (m) newNums.add(parseInt(m[1]));
  }
  const oldNums = new Set();
  for (const b of oldBlocks) {
    const m = b.match(/^(\d+)\.?\s+/);
    if (m) oldNums.add(parseInt(m[1]));
  }

  console.log('New regex: found', newNums.size, 'questions');
  console.log('Old regex: found', oldNums.size, 'questions');

  // Find which are in old but not new (lost)
  const lost = [...oldNums].filter(n => !newNums.has(n)).sort((a,b)=>a-b);
  console.log('\nQuestion numbers in old but NOT in new (lost by regex change):', lost);

  // Find which are in new but not old (gained)
  const gained = [...newNums].filter(n => !oldNums.has(n)).sort((a,b)=>a-b);
  console.log('Question numbers in new but NOT in old (gained):', gained);

  // Show raw text around the first few lost questions
  for (const num of lost.slice(0, 5)) {
    const pattern = new RegExp('(^|\\n)' + num + '[^\\d]', 'g');
    let m;
    while ((m = pattern.exec(questionText)) !== null) {
      console.log(`\n=== Raw text at "${num}": ===`);
      console.log(JSON.stringify(questionText.substring(m.index, m.index + 200)));
      break;
    }
  }

  await parser.destroy();
}
main().catch(console.error);
