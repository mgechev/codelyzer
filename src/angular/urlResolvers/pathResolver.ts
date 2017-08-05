import { join } from 'path';

export class PathResolver {
  resolve(path: string, relative: string): string {
    if (typeof path !== 'string') {
      return null;
    }
    return join(relative, path);
  }
}
