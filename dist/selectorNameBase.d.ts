import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';
export declare enum COMPONENT_TYPE {
    COMPONENT = 0,
    DIRECTIVE = 1,
    ANY = 2,
}
export declare abstract class SelectorRule extends Lint.Rules.AbstractRule {
    private validator;
    private failureString;
    private target;
    constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[], validator: Function, failureString: string, target?: COMPONENT_TYPE);
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
    getFailureString(failureConfig: any): string;
    validate(selector: string): boolean;
    readonly targetType: COMPONENT_TYPE;
}
