import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
export interface IUsePropertyDecoratorConfig {
    propertyName: string;
    decoratorName: string | string[];
    errorMessage: string;
}
export declare class UsePropertyDecorator extends Lint.Rules.AbstractRule {
    private config;
    static formatFailureString(config: IUsePropertyDecoratorConfig, decoratorName: string, className: string): string;
    constructor(config: IUsePropertyDecoratorConfig, ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[]);
    apply(sourceFile: ts.SourceFile): Lint.RuleFailure[];
}
