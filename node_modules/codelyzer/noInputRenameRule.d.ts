import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import { Ng2Walker } from './angular/ng2Walker';
export declare class Rule extends Lint.Rules.AbstractRule {
    static FAILURE_STRING: string;
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
export declare class InputMetadataWalker extends Ng2Walker {
    visitNg2Input(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]): void;
}
