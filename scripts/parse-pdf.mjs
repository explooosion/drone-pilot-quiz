/**
 * PDF Question Bank Parser
 *
 * Parses CAA drone pilot exam PDFs into structured JSON.
 * Format: Questions in chapters → Answer keys at end of each chapter.
 *
 * Usage: node scripts/parse-pdf.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const QUESTION_DIR = path.join(ROOT, 'public', 'question');
const DATA_DIR = path.join(ROOT, 'src', 'data');

/** @type {Array<{file: RegExp, type: string, label: string}>} */
const BANKS = [
  {
    file: /普通操作證學科測驗題庫.*\.pdf$/,
    type: 'basic',
    label: '普通操作證',
  },
  {
    file: /專業操作證學科測驗題庫(?!.*屆期).*\.pdf$/,
    type: 'professional',
    label: '專業操作證',
  },
  {
    file: /屆期換證學科測驗題庫(?!.*簡易).*\.pdf$/,
    type: 'renewal',
    label: '專業操作證屆期換證',
  },
];

/**
 * Extract update date from PDF text.
 * Looks for patterns like "最近更新日期：115/2/2" or header info.
 */
function extractUpdateDate(text) {
  // Try "最近更新日期：115/2/2 ~ 115/2/2"
  const match = text.match(/最近更新日期[：:]\s*([\d]+\/[\d]+\/[\d]+)/);
  if (match) {
    return match[1].replace(/\//g, '.');
  }
  // Try extracting from filename-style date
  const match2 = text.match(/(\d{3})年(\d{1,2})月(\d{1,2})日/);
  if (match2) {
    return `${match2[1]}.${match2[2]}.${match2[3]}`;
  }
  return 'unknown';
}

/**
 * Parse answer key sections from the full text.
 * Returns Map<chapterName, Map<questionNum, answerLetter>>
 */
function parseAnswerKeys(text) {
  const chapters = new Map();

  // Split by answer sections: "第X章 ...答案"
  const answerSectionRegex = /(第[一二三四五六七八九十\d]+章\s*.+?答案)\s*\n([\s\S]*?)(?=第[一二三四五六七八九十\d]+章|$)/g;
  let match;

  while ((match = answerSectionRegex.exec(text)) !== null) {
    const chapterTitle = match[1].trim();
    const answerBlock = match[2];

    // Extract chapter name without "答案" suffix
    const chapterName = chapterTitle.replace(/答案$/, '').trim();
    const answers = new Map();

    // Parse "1. D 2. D 3. C" format
    const answerRegex = /(\d+)\.\s*([A-Da-d])/g;
    let aMatch;
    while ((aMatch = answerRegex.exec(answerBlock)) !== null) {
      const num = parseInt(aMatch[1], 10);
      const letter = aMatch[2].toUpperCase();
      answers.set(num, letter);
    }

    chapters.set(chapterName, answers);
  }

  return chapters;
}

/**
 * Pre-process PDF text: strip page markers ("-- N of M --") and the standalone
 * page-number line that sometimes follows them (e.g. "2\n"). Those standalone
 * numbers fool the question-split regex into creating phantom question blocks.
 */
function stripPageMarkers(text) {
  // Pattern 1: "-- N of M --\n\n<page_num>\n" (professional PDF format)
  // Pattern 2: "-- N of M --" remaining occurrences
  return text
    .replace(/--\s*\d+\s*of\s*\d+\s*--\n+\d+\n/g, '\n')
    .replace(/--\s*\d+\s*of\s*\d+\s*--/g, '');
}

/**
 * Parse questions from a chapter block of text.
 */
function parseQuestions(text, chapterAnswers, globalIdStart) {
  const questions = [];

  // Strip page markers (and any trailing standalone page-number lines that follow
  // them in the professional PDF) BEFORE splitting into question blocks.
  // Without this, a bare "2\n(C)..." artifact from the professional PDF would
  // be mistaken for the start of question #2 by the split regex below.
  const preprocessed = stripPageMarkers(text);

  // Match question lines: "1. text", "1 text", or "175\ntext" (number on its own line).
  // \s+ intentionally includes newlines so format variations are all handled.
  const questionBlocks = preprocessed
    .split(/(?=^\d+\.?\s+[\u4e00-\u9fff(（「])/m)
    .filter((b) => b.trim());

  for (const block of questionBlocks) {
    const numMatch = block.match(/^(\d+)\.?\s+/);
    if (!numMatch) continue;

    const questionNum = parseInt(numMatch[1], 10);
    const content = block.substring(numMatch[0].length).trim();

    // Belt-and-suspenders: strip any residual page markers within a block
    const cleaned = content.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').trim();

    // Split options (A)(B)(C)(D) - handle both (A) and （A）
    const optionRegex = /\(([A-D])\)\s*/g;
    const optionPositions = [];
    let oMatch;

    while ((oMatch = optionRegex.exec(cleaned)) !== null) {
      optionPositions.push({
        letter: oMatch[1],
        index: oMatch.index,
        afterIndex: oMatch.index + oMatch[0].length,
      });
    }

    if (optionPositions.length < 2) continue; // Skip malformed

    // Question text is before first option
    const questionText = cleaned
      .substring(0, optionPositions[0].index)
      .replace(/\s+/g, ' ')
      .trim();

    // Extract option texts
    const options = [];
    for (let i = 0; i < optionPositions.length; i++) {
      const start = optionPositions[i].afterIndex;
      const end =
        i + 1 < optionPositions.length
          ? optionPositions[i + 1].index
          : cleaned.length;
      const optText = cleaned
        .substring(start, end)
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/。$/, '。')
        .replace(/\.$/, '.');
      options.push(optText);
    }

    // Get answer from answer key
    const answerLetter = chapterAnswers?.get(questionNum);
    const answerIndex = answerLetter
      ? answerLetter.charCodeAt(0) - 'A'.charCodeAt(0)
      : 0;

    if (!answerLetter) {
      console.warn(
        `  ⚠ No answer found for question ${questionNum}, defaulting to A`,
      );
    }

    questions.push({
      id: globalIdStart + questions.length,
      question: questionText,
      options,
      answer: answerIndex,
    });
  }

  return questions;
}

/**
 * Parse a full PDF text into structured question data.
 */
function parsePdfText(text) {
  const updateDate = extractUpdateDate(text);
  const answerKeys = parseAnswerKeys(text);

  // Check if this PDF has chapters
  const hasChapters =
    /第[一二三四五六七八九十\d]+章\s+[^\n]+/.test(text) &&
    answerKeys.size > 0;

  if (hasChapters) {
    return parsePdfWithChapters(text, updateDate, answerKeys);
  } else {
    return parsePdfFlat(text, updateDate);
  }
}

/**
 * Parse PDF that has chapter structure (basic + professional).
 */
function parsePdfWithChapters(text, updateDate, answerKeys) {
  // Remove answer key sections from text to avoid double-parsing
  const textWithoutAnswers = text.replace(
    /第[一二三四五六七八九十\d]+章\s*.+?答案[\s\S]*?(?=第[一二三四五六七八九十\d]+章(?!.*答案)|$)/g,
    '',
  );

  // Split into chapters
  const chapterRegex =
    /第([一二三四五六七八九十\d]+)章\s+(.+?)(?=\n)/g;
  const chapterPositions = [];
  let cMatch;

  while ((cMatch = chapterRegex.exec(textWithoutAnswers)) !== null) {
    chapterPositions.push({
      name: `第${cMatch[1]}章 ${cMatch[2].trim()}`,
      index: cMatch.index,
    });
  }

  const allQuestions = [];

  for (let i = 0; i < chapterPositions.length; i++) {
    const start = chapterPositions[i].index;
    const end =
      i + 1 < chapterPositions.length
        ? chapterPositions[i + 1].index
        : textWithoutAnswers.length;
    const chapterText = textWithoutAnswers.substring(start, end);
    const chapterName = chapterPositions[i].name;

    // Find matching answer key
    let chapterAnswers;
    for (const [key, val] of answerKeys) {
      if (
        chapterName.includes(
          key.replace(/第[一二三四五六七八九十\d]+章\s*/, '').substring(0, 4),
        ) ||
        key.includes(chapterName.substring(4, 8))
      ) {
        chapterAnswers = val;
        break;
      }
    }

    // Fallback: try to match by chapter number
    if (!chapterAnswers) {
      for (const [key, val] of answerKeys) {
        const keyNum = key.match(
          /第([一二三四五六七八九十\d]+)章/,
        )?.[1];
        const chapNum = chapterName.match(
          /第([一二三四五六七八九十\d]+)章/,
        )?.[1];
        if (keyNum && chapNum && keyNum === chapNum) {
          chapterAnswers = val;
          break;
        }
      }
    }

    if (!chapterAnswers) {
      console.warn(`  ⚠ No answer key found for "${chapterName}"`);
    }

    const questions = parseQuestions(
      chapterText,
      chapterAnswers,
      allQuestions.length + 1,
    );
    console.log(`  ${chapterName}: ${questions.length} questions`);
    allQuestions.push(...questions);
  }

  return { questions: allQuestions, updateDate };
}

/**
 * Parse PDF without chapter structure (renewal exam).
 * Questions are sequentially numbered, answer key is flat at the end.
 * Answer section starts with "答案" keyword followed by "1. A 2. B ..." lines.
 */
function parsePdfFlat(text, updateDate) {
  const flatAnswers = new Map();

  // Find the "答案" marker — everything after it is the answer key
  const answerMarkerIdx = text.lastIndexOf('答案');
  let questionText = text;

  if (answerMarkerIdx !== -1) {
    const answerSection = text.substring(answerMarkerIdx);
    // Strip page markers before question parsing but keep answer section intact
    questionText = stripPageMarkers(text.substring(0, answerMarkerIdx));

    // Parse all "num. letter" patterns from the answer section
    const answerRegex = /(\d+)\.\s*([A-Da-d])/g;
    let aMatch;
    while ((aMatch = answerRegex.exec(answerSection)) !== null) {
      flatAnswers.set(
        parseInt(aMatch[1], 10),
        aMatch[2].toUpperCase(),
      );
    }
  }

  const questions = parseQuestions(questionText, flatAnswers, 1);
  console.log(`  Flat format: ${questions.length} questions, ${flatAnswers.size} answers`);

  return { questions, updateDate };
}

async function parsePdf(filePath) {
  console.log(`\nParsing: ${path.basename(filePath)}`);
  const buf = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  const text = result.text;
  const parsed = parsePdfText(text);
  await parser.destroy();
  return parsed;
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const pdfFiles = fs
    .readdirSync(QUESTION_DIR)
    .filter((f) => f.endsWith('.pdf'));
  console.log(`Found ${pdfFiles.length} PDF files in ${QUESTION_DIR}`);

  const metadata = {};
  let totalQuestions = 0;

  for (const bank of BANKS) {
    const file = pdfFiles.find((f) => bank.file.test(f));
    if (!file) {
      console.warn(`⚠ No PDF found for ${bank.label} (${bank.type})`);
      continue;
    }

    const filePath = path.join(QUESTION_DIR, file);
    const { questions, updateDate } = await parsePdf(filePath);

    const outputPath = path.join(DATA_DIR, `${bank.type}.json`);
    const bankData = {
      type: bank.type,
      label: bank.label,
      updateDate,
      lastParsed: new Date().toISOString().split('T')[0],
      questions,
    };

    fs.writeFileSync(outputPath, JSON.stringify(bankData, null, 2), 'utf-8');
    console.log(
      `✓ ${bank.label}: ${questions.length} questions → ${path.relative(ROOT, outputPath)}`,
    );

    metadata[bank.type] = {
      label: bank.label,
      updateDate,
      questionCount: questions.length,
      lastParsed: bankData.lastParsed,
      fileName: file,
    };

    totalQuestions += questions.length;
  }

  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`\n✓ Total: ${totalQuestions} questions across ${Object.keys(metadata).length} banks`);
  console.log(`✓ Metadata → ${path.relative(ROOT, metadataPath)}`);
}

main().catch((err) => {
  console.error('Parse failed:', err);
  process.exit(1);
});
