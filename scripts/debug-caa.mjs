// Inspect CAA page HTML structure to understand link format
import fs from 'node:fs';

async function main() {
  const url = 'https://www.caa.gov.tw/Article.aspx?a=3833&lang=1';
  console.log('Fetching:', url);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
    }
  });
  if (!res.ok) { console.error('HTTP', res.status); return; }
  const html = await res.text();
  console.log('Page length:', html.length);

  // Save full HTML to file for inspection
  fs.writeFileSync('/tmp/caa-page.html', html);
  console.log('Saved to /tmp/caa-page.html');

  // Find any href containing FileAtt, pdf, or download keywords
  const hrefRegex = /href=["']([^"']*(?:FileAtt|\.pdf|download|file)[^"']*?)["']/gi;
  const hrefs = new Set();
  let m;
  while ((m = hrefRegex.exec(html)) !== null) hrefs.add(m[1]);
  console.log('\nRelevant hrefs found:', hrefs.size);
  for (const h of hrefs) console.log(' ', h);

  // Also show any anchor tags with Chinese text about 題庫
  const anchorRegex = /<a[^>]+>([^<]*(?:題庫|學科|操作證)[^<]*)<\/a>/gi;
  console.log('\nAnchors with 題庫/學科/操作證:');
  while ((m = anchorRegex.exec(html)) !== null) {
    const hrefMatch = m[0].match(/href=["']([^"']+)["']/i);
    console.log(`  text="${m[1].trim()}" href="${hrefMatch?.[1] ?? 'none'}"`);
  }
}
main().catch(console.error);
