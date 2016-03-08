import * as Lint from 'tslint/lib/lint';
import {ExpressionCallRule} from "./expressionCallBase";

const forwardRefValidator = (callExpression)=>{
    return (callExpression.expression.text==='forwardRef');
};

const FAILURE_STRING:string ='In the class "%s" you are calling forwardRef, which is considered a bad practice ' +
    'and indicates either a cyclic dependency or inconsistency in the services declaration';

export class Rule extends ExpressionCallRule{

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[]) {
        super(ruleName, value, disabledIntervals,forwardRefValidator,FAILURE_STRING);
    }
}