import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
export declare class Rule extends Lint.Rules.AbstractRule {
    static FAILURE: string;
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
