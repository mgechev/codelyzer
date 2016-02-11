import * as Lint from 'tslint/lib/lint';

import {UseParameterDecorator} from './parameterDecoratorBase';

export class Rule extends UseParameterDecorator {
  constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[]) {
    super({
      decoratorName: 'Output',
      propertyName: 'outputs',
      errorMessage: null
    }, ruleName, value, disabledIntervals);
  }
}
