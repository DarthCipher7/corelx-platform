const fs = require('fs');
const path = require('path');

const files = [
  'src/app/about/page.tsx',
  'src/app/terms/page.tsx',
  'src/app/privacy/page.tsx',
  'src/app/careers/page.tsx',
  'src/app/changelog/page.tsx',
  'src/app/api-docs/page.tsx',
  'src/app/features/page.tsx',
  'src/app/pricing/page.tsx',
  'src/app/community/page.tsx',
  'src/app/contact/ContactClient.tsx',
  'src/app/blog/page.tsx',
  'src/app/blog/[slug]/page.tsx'
];

for (const file of files) {
  const fullPath = path.join('c:/Nova/04_ENGINEERING/nova-platform', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/\btext-white\b/g, 'text-[var(--text-primary)]');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Remediated contrast in:', file);
  }
}
