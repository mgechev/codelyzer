import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import { Ng2Walker } from './angular/ng2Walker';
export declare class Rule extends Lint.Rules.AbstractRule {
    static FAILURE_STRING: string;
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
export declare class ValidateInjectableWalker extends Ng2Walker {
    visitClassDeclaration(declaration: ts.ClassDeclaration): void;
}
