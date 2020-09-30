import * as ts from 'typescript';
import { NgWalker } from '../angular/ngWalker';
import { IOptions } from 'tslint';
import { ComponentMetadata } from '../angular/metadata';
import { F1, Maybe } from '../util/function';

// Walkable types
export type Walkable = 'NgComponent';

export function allNgComponent(): WalkerBuilder<'NgComponent'> {
  return new NgComponentWalkerBuilder();
}

export class Failure {
  constructor(public node: ts.Node, public message: string) {}
}

export interface WalkerBuilder<T extends Walkable> {
  where: (validate: F1<ComponentMetadata, Maybe<Failure>>) => WalkerBuilder<T>;
  build: (sourceFile: ts.SourceFile, options: IOptions) => NgWalker;
}

class NgComponentWalkerBuilder implements WalkerBuilder<'NgComponent'> {
  private _where!: F1<ComponentMetadata, Maybe<Failure>>;

  where(validate: F1<ComponentMetadata, Maybe<Failure>>): NgComponentWalkerBuilder {
    this._where = validate;
    return this;
  }

  build(sourceFile: ts.SourceFile, options: IOptions): NgWalker {
    const self = this;
    const e = class extends NgWalker {
      visitNgComponent(meta: ComponentMetadata) {
        self._where(meta).fmap((failure) => this.addFailureAtNode(failure.node, failure.message));
        super.visitNgComponent(meta);
      }
    };
    return new e(sourceFile, options);
  }
}
