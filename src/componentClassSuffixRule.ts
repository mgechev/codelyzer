import * as Lint from 'tslint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import {ComponentMetadata} from './angular/metadata';
import {allNg2Component, Failure} from './walkerFactory/walkerFactory';
import {Maybe} from './util/function';

export class Rule extends Lint.Rules.AbstractRule {
    static FAILURE: string = 'The name of the class %s should end with the suffix Component ($$02-03$$)';

    static validate(className: string): boolean {
        return /.*Component$/.test(className);
    }

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(
            allNg2Component()
                .where((meta: ComponentMetadata) => {
                    let name = meta.controller.name;
                    let className: string = name.text;
                    if (!Rule.validate(className)) {
                        return Maybe.lift(
                            new Failure(name, sprintf(Rule.FAILURE, className)))
                    }
                    return Maybe.nothing;
                })
                .build(sourceFile, this.getOptions())
        );
    }
}
