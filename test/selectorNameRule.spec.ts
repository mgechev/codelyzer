import {Rule} from '../src/selectorNameRule';
import {assertFailure} from './testHelper';

describe('selector-name', () => {
  it('should fail when set invalid selector in @Component', () => {
    let source = `
      @Component({
        selector: '[foo]'
      })
      class Test {}
    `;
    assertFailure('selector-name', source, ['Invalid selector %s for component %s.']);
  });
});
