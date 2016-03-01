import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {ClassParameterRule} from "./propertyClassBase";
import {decoratorValidator} from './util/decoratorValidator';

const FAILURE_STRING = 'In the class "%s", the directive input property "%s" should not be renamed.' +
    'Please, consider the following use "@Input() %s: string"';

const renameInputCondition = (name, arg)=> {
    return (name === 'Input' && arg);
};

export class Rule extends ClassParameterRule {

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[]) {
        super(ruleName, value, disabledIntervals, decoratorValidator(renameInputCondition), FAILURE_STRING);
    }

}