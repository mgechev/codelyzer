import * as Lint from 'tslint/lib/lint';
import { SelectorRule } from './selectorNameBase';
export declare class Rule extends SelectorRule {
    constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[]);
}
