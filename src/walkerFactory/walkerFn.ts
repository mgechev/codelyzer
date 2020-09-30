import * as ts from 'typescript';
import { NgWalker } from '../angular/ngWalker';
import { IOptions } from 'tslint';
import { ComponentMetadata } from '../angular/metadata';
import { F1, F2, Maybe } from '../util/function';
import { Failure } from './walkerFactory';

export type Validator = NodeValidator | ComponentValidator;
export type ValidateFn<T> = F2<T, IOptions, Maybe<Failure[] | undefined>>;
export type WalkerOptions = any;

export interface NodeValidator {
  kind: 'Node';
  validate: ValidateFn<ts.Node>;
}

export interface ComponentValidator {
  kind: 'NgComponent';
  validate: ValidateFn<ComponentMetadata>;
}

export function validate(syntaxKind: ts.SyntaxKind): F1<ValidateFn<ts.Node>, NodeValidator> {
  return (validateFn) => ({
    kind: 'Node',
    validate: (node: ts.Node, options: WalkerOptions) => (node.kind === syntaxKind ? validateFn(node, options) : Maybe.nothing),
  });
}

export function validateComponent(validate: F2<ComponentMetadata, WalkerOptions, Maybe<Failure[] | undefined>>): ComponentValidator {
  return {
    kind: 'NgComponent',
    validate,
  };
}

export function all(...validators: Validator[]): F2<ts.SourceFile, IOptions, NgWalker> {
  return (sourceFile, options) => {
    const e = class extends NgWalker {
      visitNgComponent(meta: ComponentMetadata) {
        validators.forEach((v) => {
          if (v.kind === 'NgComponent') {
            v.validate(meta, this.getOptions()).fmap((failures) => failures!.forEach((f) => this.generateFailure(f)));
          }
        });
        super.visitNgComponent(meta);
      }

      visitNode(node: ts.Node) {
        validators.forEach((v) => {
          if (v.kind === 'Node') {
            v.validate(node, this.getOptions()).fmap((failures) => failures!.forEach((f) => this.generateFailure(f)));
          }
        });
        super.visitNode(node);
      }

      private generateFailure(failure: Failure) {
        this.addFailureAtNode(failure.node, failure.message);
      }
    };
    return new e(sourceFile, options);
  };
}
