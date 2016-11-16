import * as Lint from 'tslint/lib/lint';
import { UsePropertyDecorator } from './propertyDecoratorBase';
export declare class Rule extends UsePropertyDecorator {
    constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[]);
}
