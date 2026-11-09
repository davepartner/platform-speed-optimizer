// Lint the skill: valid SKILL.md frontmatter + no broken internal links.
// Usage: node scripts/lint.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let errors = 0;

function fail(msg) {
  console.error(`✗ ${msg}`);
  errors += 1;
}

// 1) SKILL.md frontmatter
const skillPath = path.join(root, 'SKILL.md');
const skill = fs.readFileSync(skillPath, 'utf8');
if (!skill.startsWith('---')) fail('SKILL.md must start with YAML frontmatter');
if (!/^name:\s*\S+/m.test(skill)) fail('SKILL.md frontmatter missing "name"');
if (!/^description:\s*>-?/m.test(skill) && !/^description:\s*\S+/m.test(skill)) {
  fail('SKILL.md frontmatter missing "description"');
}

// 2) Internal markdown links resolve
const mdFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.md')) mdFiles.push(p);
  }
})(root);

const linkRe = /\]\(([^)]+)\)/g;
for (const file of mdFiles) {
  const text = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = linkRe.exec(text))) {
    const href = m[1].trim();
    if (/^(https?:|mailto:|#)/.test(href)) continue;
    const target = href.split('#')[0];
    if (!target) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) {
      fail(`${path.relative(root, file)}: broken link -> ${href}`);
    }
  }
}

if (errors) {
  console.error(`\n${errors} problem(s) found.`);
  process.exit(1);
}
console.log('lint ok — frontmatter valid, all internal links resolve.');
