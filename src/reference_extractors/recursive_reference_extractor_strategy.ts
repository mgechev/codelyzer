import * as fs from 'fs';
import * as ts from 'typescript';

import {ReferenceExtractorStrategy} from './reference_extractor_strategy';

// TODO (mgechev) Handle circular dependencies
export class RecursiveReferenceExtractorStrategy extends ReferenceExtractorStrategy {
  constructor(private fileCache, private ls) {
    super();
  }
  extract(nodes: ts.Identifier[], file: ts.SourceFile, walkerFactory): any[] {
    return nodes.map(node => {
      this.ls.getSourceFile(file.fileName);
      let locs = this.ls.getDefinitionAtPosition(file.fileName, node.pos + 1);
      let def = null;
      // DFS for the correct definition.
      // Handling only a single definition here.
      while (locs && locs.length) {
        let current = locs.pop();
        if (current.kind === 'class') {
          def = current;
          break;
        } else {
          locs = locs.concat(this.ls.getDefinitionAtPosition(current.fileName, current.textSpan.start));
        }
      }
      let info = {
        def: def,
        file: def && def.fileName,
        min: def && this.fileCache.positionToLineCol(def.fileName, def.textSpan.start),
        lim: def && this.fileCache.positionToLineCol(def.fileName, ts.textSpanEnd(def.textSpan))
      };
      if (def && info.file) {
        let file = ts.createSourceFile(info.file, fs.readFileSync(info.file).toString(), ts.ScriptTarget.ES2015, true);
        let visitor = walkerFactory(new RecursiveReferenceExtractorStrategy(this.fileCache, this.ls));
        return visitor.getMetadata(file, [node.text]).pop();
      }
      return null;
    });
  }
}

