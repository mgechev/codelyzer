import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {ClassParameterRule} from "./propertyClassBase";
import {decoratorValidator} from './util/decoratorValidator';

const FAILURE_STRING = 'In the class "%s", the directive output property "%s" should not be renamed.' +
    'Please, consider the following use "@Output() %s = new EventEmitter();"';

const renameOutputCondition = (name, arg)=> {
    return (name === 'Output' && arg);
};

export class Rule extends ClassParameterRule {

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[]) {
        super(ruleName, value, disabledIntervals, decoratorValidator(renameOutputCondition), FAILURE_STRING);
    }

}