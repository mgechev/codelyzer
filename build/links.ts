import {readFileSync, writeFileSync, readdirSync, lstatSync} from 'fs';
import {join} from 'path';

const LINKS = require('../../style-guide-links/all.json');
const ARGS = require('minimist')(process.argv.slice(2));
const SRC = ARGS.src;

const processFiles = (path: string) => {
  const files = readdirSync(path);
  files.forEach((fileName: string) => {
    const filePath = join(path, fileName);
    if (/\.js$/.test(fileName) && lstatSync(filePath).isFile()) {
      writeFileSync(filePath, processFileContent(readFileSync(filePath).toString()));
    }
  });
};

const processFileContent = (content: string) => {
  return content.replace(/\$\$(\d\d-\d\d)\$\$/g, (substring: string, code: string) => {
    const link = LINKS[code];
    if (link === undefined) {
      throw new Error('Non existing link for style #' + code);
    }
    return link;
  });
};

try {
  processFiles(SRC);
} catch (e) {
  console.error(e);
}
