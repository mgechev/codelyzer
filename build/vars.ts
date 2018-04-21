import { processFiles } from './processFiles';

const ARGS = require('minimist')(process.argv.slice(2));
const SRC = ARGS.src;
const BUILD_TYPE = process.env.BUILD_TYPE;

try {
  processFiles(SRC, {
    regexp: /<%=\s*BUILD_TYPE\s*%>/g,
    replace: BUILD_TYPE
  });
} catch (e) {
  console.error(e);
}
