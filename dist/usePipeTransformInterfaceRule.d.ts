import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
export declare class Rule extends Lint.Rules.AbstractRule {
    static FAILURE: string;
    static PIPE_INTERFACE_NAME: string;
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
export declare class ClassMetadataWalker extends Lint.RuleWalker {
    visitClassDeclaration(node: ts.ClassDeclaration): void;
    private hasIPipeTransform(node);
}
