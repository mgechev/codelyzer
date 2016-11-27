import {processFiles} from './processFiles';

const LINKS = require('../../style-guide-links/all.json');
const ARGS = require('minimist')(process.argv.slice(2));
const SRC = ARGS.src;

try {
  processFiles(SRC, {
    regexp: /\$\$(\d\d-\d\d)\$\$/g,
    replace: (substring: string, code: string) => {
      const link = LINKS[code];
      if (link === undefined) {
        throw new Error('Non existing link for style #' + code);
      }
      return link;
    }
  });
} catch (e) {
  console.error(e);
}
