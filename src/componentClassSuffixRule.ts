import * as Lint from 'tslint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import {ComponentMetadata} from './angular/metadata';
import {Failure} from './walkerFactory/walkerFactory';
import {all, validateComponent} from './walkerFactory/walkerFn';
import {Maybe, F2} from './util/function';
import {IOptions} from 'tslint';
import {Ng2Walker} from './angular/ng2Walker';

export class Rule extends Lint.Rules.AbstractRule {
    static FAILURE: string = 'The name of the class %s should end with the suffix Component ($$02-03$$)';

    static validate(className: string): boolean {
        return /.*Component$/.test(className);
    }

    static walkerBuilder: F2<ts.SourceFile, IOptions, Ng2Walker> =
        all(
            validateComponent((meta: ComponentMetadata) =>
                Maybe.lift(meta.controller)
                    .fmap(controller => controller.name)
                    .fmap(name => {
                        const className = name.text;
                        if (!Rule.validate(className)) {
                            return [ new Failure(name, sprintf(Rule.FAILURE, className)) ];
                        }
                    })
            ));

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(
            Rule.walkerBuilder(sourceFile, this.getOptions())
        );
    }
}
