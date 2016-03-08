import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {decoratorValidator} from './util/decoratorValidator';
import {RuleBase} from "./util/rulesBase";
import {ClassMetadataWalker} from "./classMetadataWalker";

const FAILURE_STRING = 'In the class "%s", the directive output property "%s" should not be renamed.' +
    'Please, consider the following use "@Output() %s = new EventEmitter();"';

const renameOutputCondition = (name, arg, element)=> {
    let memberName = element.name.text;
    return (name === 'Output' && arg && memberName !== arg.text);
};

export class Rule extends RuleBase {

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[]) {
        super(ruleName, value, disabledIntervals,
            decoratorValidator(renameOutputCondition),
            FAILURE_STRING, ClassMetadataWalker);
    }

}