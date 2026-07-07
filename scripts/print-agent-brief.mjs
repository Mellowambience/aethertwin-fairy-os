import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = ['AGENTS.md', 'docs/PRODUCT_SPEC.md', 'docs/ROADMAP.md'];
for (const file of files) {
  const full = path.join(root, file);
  console.log(`\n--- ${file} ---\n`);
  console.log(fs.readFileSync(full, 'utf8'));
}
