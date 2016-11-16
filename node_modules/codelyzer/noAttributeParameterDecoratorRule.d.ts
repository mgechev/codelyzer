import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
export declare class Rule extends Lint.Rules.AbstractRule {
    static FAILURE_STRING: string;
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
export declare class ConstructorMetadataWalker extends Lint.RuleWalker {
    visitConstructorDeclaration(node: ts.ConstructorDeclaration): void;
    validateParameter(className: string, parameter: any): void;
}
