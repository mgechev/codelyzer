import * as Lint from 'tslint/lib/lint';

import {UsePropertyDecorator} from './propertyDecoratorBase';

export class Rule extends UsePropertyDecorator {
  constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[]) {
    super({
      decoratorName: 'Output',
      propertyName: 'outputs',
      errorMessage: 'Use the @Output property decorator instead of the outputs property (https://goo.gl/79yChE)'
    }, ruleName, value, disabledIntervals);
  }
}
