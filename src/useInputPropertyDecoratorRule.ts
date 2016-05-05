import * as Lint from 'tslint/lib/lint';

import {UsePropertyDecorator} from './propertyDecoratorBase';

export class Rule extends UsePropertyDecorator {
  constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[]) {
    super({
      decoratorName: 'Input',
      propertyName: 'inputs',
      errorMessage: 'Use the @Input property decorator instead of the inputs property ($$05-12$$)'
    }, ruleName, value, disabledIntervals);
  }
}
