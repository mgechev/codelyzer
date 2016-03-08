import * as Lint from 'tslint/lib/lint';
import {RuleBase} from "./util/rulesBase";
import {ExpressionCallMetadataWalker} from "./expressionCallMetadataWalker";

const forwardRefValidator = (callExpression)=> {
    return (callExpression.expression.text === 'forwardRef');
};

const FAILURE_STRING:string = 'In the class "%s" you are calling forwardRef, which is considered a bad practice ' +
    'and indicates either a cyclic dependency or inconsistency in the services declaration';

export class Rule extends RuleBase {

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[]) {
        super(ruleName, value, disabledIntervals,
            forwardRefValidator, FAILURE_STRING,
            ExpressionCallMetadataWalker);
    }
}