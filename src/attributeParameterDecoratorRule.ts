import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {ConstructorRule} from "./parameterConstructorBase";

const attributeValidator = (parameter:ts.ParameterDeclaration)=>{
    let isValid = true;
    if (parameter.decorators) {
        parameter.decorators.forEach((decorator:ts.Decorator)=> {
            let baseExpr = <any>decorator.expression || {};
            let expr = baseExpr.expression || {};
            let name = expr.text;
            if (name==='Attribute') {
                isValid = false
            }
        });
    }
    return isValid;
};

const FAILURE_STRING = 'In the constructor of class "%s", the parameter "%s" uses the @Attribute decorator, ' +
    'which is considered as a bad practice. Please, consider construction of type "@Input() %s: string"';

export class Rule extends ConstructorRule {

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[]) {
        super(ruleName, value, disabledIntervals,attributeValidator,FAILURE_STRING);
    }

}