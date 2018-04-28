import { FileResolver } from './fileResolver';

export class DummyFileResolver extends FileResolver {
  resolve(path: string) {
    return '';
  }
}
