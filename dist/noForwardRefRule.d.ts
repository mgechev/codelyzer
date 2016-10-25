import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
export declare class Rule extends Lint.Rules.AbstractRule {
    static FAILURE_IN_CLASS: string;
    static FAILURE_IN_VARIABLE: string;
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
export declare class ExpressionCallMetadataWalker extends Lint.RuleWalker {
    visitCallExpression(node: ts.CallExpression): void;
    private validateCallExpression(callExpression);
}
