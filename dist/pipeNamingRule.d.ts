import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import { Ng2Walker } from './angular/ng2Walker';
export declare class Rule extends Lint.Rules.AbstractRule {
    static FAILURE_WITHOUT_PREFIX: string;
    static FAILURE_WITH_PREFIX: string;
    prefix: string;
    hasPrefix: boolean;
    private prefixChecker;
    private validator;
    constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[]);
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
    validateName(name: string): boolean;
    validatePrefix(prefix: string): boolean;
}
export declare class ClassMetadataWalker extends Ng2Walker {
    private rule;
    constructor(sourceFile: ts.SourceFile, rule: Rule);
    visitNg2Pipe(controller: ts.ClassDeclaration, decorator: ts.Decorator): void;
    private validateProperties(className, pipe);
    private extractArgument(pipe);
    private validateProperty(className, property);
    private createFailureArray(className, pipeName);
}
