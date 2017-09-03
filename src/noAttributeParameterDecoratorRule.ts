import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import SyntaxKind = require('./util/syntaxKind');
import { validate, all } from './walkerFactory/walkerFn';
import { Maybe, listToMaybe } from './util/function';
import { isDecorator, withIdentifier, callExpression } from './util/astQuery';
import { Failure } from './walkerFactory/walkerFactory';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'no-attribute-parameter-decorator',
    type: 'maintainability',
    description: `Disallow usage of @Attribute decorator`,
    rationale: `@Attribute is considered bad practice. Use @Input instead.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };

    static FAILURE_STRING: string = 'In the constructor of class "%s",' +
        ' the parameter "%s" uses the @Attribute decorator, ' +
        'which is considered as a bad practice. Please,' +
        ' consider construction of type "@Input() %s: string"';


    private static walkerBuilder = all(
        validate(SyntaxKind.current().Constructor)((node: ts.ConstructorDeclaration) => {
            const syntaxKind = SyntaxKind.current();
            return Maybe.lift(node.parent)
                .fmap(parent => {
                    if (parent.kind === syntaxKind.ClassExpression) {
                        return parent.parent.name.text;
                    } else if (parent.kind = syntaxKind.ClassDeclaration) {
                        return parent.name.text;
                    }
                })
                .bind(parentName => {
                    const failures: Maybe<Failure>[] = node.parameters.map(p =>
                        Maybe.lift(p.decorators)
                            .bind(decorators => {
                                // Check if any @Attribute
                                const decoratorsFailed = listToMaybe(
                                    decorators.map(d => Rule.decoratorIsAttribute(d)));

                                // We only care about 1 since we highlight the whole 'parameter'
                                return decoratorsFailed.fmap(() =>
                                    new Failure(p, sprintf(Rule.FAILURE_STRING,
                                        parentName, (<any>p.name).text, (<any>p.name).text)));
                            })
                    );
                    return listToMaybe(failures);
                });
        })
    );

    private static decoratorIsAttribute(dec: ts.Decorator): Maybe<ts.CallExpression> {
        if (isDecorator(dec)) {
            return callExpression(dec).bind(withIdentifier('Attribute'));
        }
        return Maybe.nothing;
    }

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(
            Rule.walkerBuilder(sourceFile, this.getOptions()));
    }
}
