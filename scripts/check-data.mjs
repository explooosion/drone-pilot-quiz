import fs from 'node:fs';

const basic = JSON.parse(fs.readFileSync('src/data/basic.json', 'utf8'));
const professional = JSON.parse(fs.readFileSync('src/data/professional.json', 'utf8'));
const renewal = JSON.parse(fs.readFileSync('src/data/renewal.json', 'utf8'));

function checkBank(bank) {
  const issues = [];
  for (const q of bank.questions) {
    if (!q.question || q.question.trim().length < 5) {
      issues.push({ id: q.id, issue: 'empty/short question', question: JSON.stringify(q.question) });
    }
    if (!q.options || q.options.length < 4) {
      issues.push({ id: q.id, issue: 'missing options (only ' + q.options?.length + ')', question: q.question?.substring(0,40) });
    }
    if (q.options && q.options.some(o => !o || o.trim().length === 0)) {
      const emptyIdx = q.options.findIndex(o => !o || o.trim().length === 0);
      issues.push({ id: q.id, issue: 'empty option[' + emptyIdx + ']', question: q.question?.substring(0,40) });
    }
  }
  return issues;
}

let totalIssues = 0;

for (const bank of [basic, professional, renewal]) {
  const issues = checkBank(bank);
  const status = issues.length === 0 ? '✓' : '✗';
  console.log(`${status} ${bank.label}: ${bank.questions.length} questions, ${issues.length} issues`);
  if (issues.length > 0) {
    for (const i of issues.slice(0, 20)) console.error(' ', JSON.stringify(i));
    if (issues.length > 20) console.error(`  ... and ${issues.length - 20} more`);
  }
  totalIssues += issues.length;
}

if (totalIssues > 0) {
  console.error(`\n✗ Validation failed: ${totalIssues} total issue(s) found across all banks.`);
  process.exit(1);
}

console.log('\n✓ All banks passed validation.');
