import * as Lint from 'tslint/lib/lint';
import {SelectorRule, COMPONENT_TYPE} from './selectorNameBase';
import {SelectorValidator} from './util/selectorValidator';

const FAILURE_STRING = 'The selector of the component "%s" should be named %s, however its value is "%s".';

export class Rule extends SelectorRule {
  constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[]) {
    let validator = SelectorValidator.camelCase;
    if (value[1] === 'kebab-case') {
      validator = SelectorValidator.kebabCase;
    }
    super(ruleName, value, disabledIntervals, validator, FAILURE_STRING, COMPONENT_TYPE.COMPONENT);
  }
}
