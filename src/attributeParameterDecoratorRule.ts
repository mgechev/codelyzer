import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {decoratorValidator} from "./util/decoratorValidator";
import {ConstructorMetadataWalker} from "./constructorMetadataWalker";
import {RuleBase} from "./util/rulesBase";

const FAILURE_STRING = 'In the constructor of class "%s", the parameter "%s" uses the @Attribute decorator, ' +
    'which is considered as a bad practice. Please, consider construction of type "@Input() %s: string"';

const attributeCondition = (name)=> {
    return (name == 'Attribute')
};

export class Rule extends RuleBase {

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[]) {
        super(ruleName, value, disabledIntervals,
            decoratorValidator(attributeCondition),
            FAILURE_STRING, ConstructorMetadataWalker);
    }

}