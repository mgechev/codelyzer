import * as Lint from 'tslint/lib/lint';

import {UsePropertyDecorator} from './propertyDecoratorBase';

export class Rule extends UsePropertyDecorator {
  constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[]) {
    super({
      decoratorName: ['HostBindings', 'HostListeners'],
      propertyName: 'host',
      errorMessage: 'Use @HostBindings and @HostListeners instead of the host property (https://goo.gl/NMgSUQ)'
    }, ruleName, value, disabledIntervals);
  }
}
