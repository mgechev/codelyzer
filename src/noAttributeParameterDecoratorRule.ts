import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { validate, all } from './walkerFactory/walkerFn';
import { Maybe, listToMaybe } from './util/function';
import { withIdentifier, callExpression } from './util/astQuery';
import { Failure } from './walkerFactory/walkerFactory';

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Disallow usage of @Attribute decorator.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: '@Attribute is considered bad practice. Use @Input instead.',
    ruleName: 'no-attribute-parameter-decorator',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING =
    'In the constructor of class "%s", the parameter "%s" uses the @Attribute decorator, which is considered as a bad practice. Please, consider construction of type "@Input() %s: string"';

  private static readonly walkerBuilder = all(
    validate(ts.SyntaxKind.Constructor)(node => {
      return Maybe.lift(node.parent)
        .fmap(parent => {
          if (parent && ts.isClassExpression(parent) && (parent.parent as any).name) {
            return (parent.parent as any).name.text;
          } else if (parent && ts.isClassDeclaration(parent)) {
            return parent.name!.text;
          }
        })
        .bind(parentName => {
          const failures: Maybe<Failure | undefined>[] = (node as any).parameters.map(p => {
            const text = p.name.getText();

            return Maybe.lift(p.decorators).bind(decorators => {
              // Check if any @Attribute
              const decoratorsFailed = listToMaybe(decorators.map(d => Rule.decoratorIsAttribute(d)));

              // We only care about 1 since we highlight the whole 'parameter'
              return (decoratorsFailed as any).fmap(() => new Failure(p, sprintf(Rule.FAILURE_STRING, parentName, text, text)));
            });
          });

          return listToMaybe(failures) as any;
        });
    })
  );

  private static decoratorIsAttribute(dec: ts.Decorator): Maybe<ts.CallExpression | undefined> {
    return callExpression(dec).bind(withIdentifier('Attribute') as any);
  }

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(Rule.walkerBuilder(sourceFile, this.getOptions()));
  }
}
