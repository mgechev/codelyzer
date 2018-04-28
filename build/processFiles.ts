import { readFileSync, writeFileSync, readdirSync, lstatSync } from 'fs';
import { join } from 'path';

interface Replacement {
  regexp: RegExp;
  replace: any;
}

const processFileContent = (content: string, replacement: Replacement) => {
  return content.replace(replacement.regexp, replacement.replace);
};

export const processFiles = (path: string, replacement: Replacement) => {
  const files = readdirSync(path);
  files.forEach((fileName: string) => {
    const filePath = join(path, fileName);
    if (/\.js$/.test(fileName) && lstatSync(filePath).isFile()) {
      writeFileSync(filePath, processFileContent(readFileSync(filePath).toString(), replacement));
    } else if (lstatSync(filePath).isDirectory()) {
      processFiles(filePath, replacement);
    }
  });
};
