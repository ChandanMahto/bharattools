import {
  copyFileSync,
  existsSync,
  writeFileSync
} from 'node:fs';

const outputDirectory = 'dist/bharattools/browser';

const csrIndex = `${outputDirectory}/index.csr.html`;
const regularIndex = `${outputDirectory}/index.html`;

if (existsSync(csrIndex)) {
  copyFileSync(csrIndex, regularIndex);
}

if (!existsSync(regularIndex)) {
  throw new Error('Angular index.html was not generated.');
}

writeFileSync(
  `${outputDirectory}/_redirects`,
  '/* /index.html 200\n'
);

console.log('Cloudflare Pages static output prepared.');