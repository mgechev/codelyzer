import { readFileSync } from 'fs';

import { FileResolver } from './fileResolver';

export class FsFileResolver extends FileResolver {
  resolve(path: string) {
    return readFileSync(path).toString();
  }
}
