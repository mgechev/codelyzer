import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {ConstructorRule} from "./parameterConstructorBase";
import {decoratorValidator} from "./util/decoratorValidator";

const FAILURE_STRING = 'In the constructor of class "%s", the parameter "%s" uses the @Attribute decorator, ' +
    'which is considered as a bad practice. Please, consider construction of type "@Input() %s: string"';

const attributeCondition = (name)=>{
    return (name=='Attribute')
};

export class Rule extends ConstructorRule {

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[]) {
        super(ruleName, value, disabledIntervals,decoratorValidator(attributeCondition),FAILURE_STRING);
    }

}