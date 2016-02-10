import * as Lint from 'tslint/lib/lint';
import {SelectorNameRule} from './selectorBase';

const DEFAULT_CONFIG = ['element', 'kebab-case'];

export class Rule extends SelectorNameRule {
  protected normalizeOptions(options: Lint.IOptions) {
    if (!options.ruleArguments) {
      options.ruleArguments = DEFAULT_CONFIG;
    }
    return options;
  }
}
