import * as Lint from 'tslint/lib/lint';
import {SelectorRule, COMPONENT_TYPE} from './selectorNameBase';
import {SelectorValidator} from './util/selectorValidator';

const FAILURE_STRING = 'The selector of the directive "%s" should have prefix "%s", however its value is "%s".';

export class Rule extends SelectorRule {
  constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[]) {
    super(ruleName, value, disabledIntervals, SelectorValidator.prefix(value[1]), FAILURE_STRING, COMPONENT_TYPE.DIRECTIVE);
  }
}
