import * as Lint from 'tslint/lib/lint';
import {SelectorRule, COMPONENT_TYPE} from './selectorNameBase';
import {SelectorValidator} from './util/selector-validator';

const FAILURE_SINGLE = 'The selector of the directive "%s" should have prefix "%s" ($$02-08$$)';
const FAILURE_MANY = 'The selector of the directive "%s" should have one of the prefixes: %s ($$02-08$$)';

export class Rule extends SelectorRule {
  constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[]) {
    let prefixExpression:string = (value.slice(1) || []).join('|');
    let FAIL_MESSAGE:string=value.length > 2 ? FAILURE_MANY : FAILURE_SINGLE;
    super(ruleName, value, disabledIntervals, SelectorValidator.multiPrefix(prefixExpression), FAIL_MESSAGE, COMPONENT_TYPE.DIRECTIVE);
  }
}
