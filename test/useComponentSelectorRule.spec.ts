import { getFailureMessage, Rule } from '../src/useComponentSelectorRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when selector is not given in @Component', () => {
      const source = `
        @Component()
        ~~~~~~~~~~~~
        class Test {}
      `;
      const message = getFailureMessage({
        className: 'Test',
      });
      assertAnnotated({
        message,
        ruleName,
        source,
      });
    });

    it('should fail when selector is empty in @Component', () => {
      const source = `
        @Component({
        ~~~~~~~~~~~~
          selector: ''
        })
        ~~
        class Test {}
      `;
      const message = getFailureMessage({
        className: 'Test',
      });
      assertAnnotated({
        message,
        ruleName,
        source,
      });
    });

    it('should fail when selector equals 0 in @Component', () => {
      const source = `
        @Component({
        ~~~~~~~~~~~~
          selector: 0
        })
        ~~
        class Test {}
      `;
      const message = getFailureMessage({
        className: 'Test',
      });
      assertAnnotated({
        message,
        ruleName,
        source,
      });
    });

    it('should fail when selector equals null in @Component', () => {
      const source = `
        @Component({
        ~~~~~~~~~~~~
          selector: null
        })
        ~~
        class Test {}
      `;
      const message = getFailureMessage({
        className: 'Test',
      });
      assertAnnotated({
        message,
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed when selector is given in @Component', () => {
      const source = `
        @Component({
          selector: 'sg-bar-foo'
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
