import { Rule } from '../src/noHostMetadataPropertyRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if "host" metadata property is used in @Component', () => {
      const source = `
        @Component({
          host: [
          ~~~~~~~
            class: 'my-class',
            [type]: 'test',
            '(click)': 'bar()'
          ],
          ~
          selector: 'app-test'
        })
        class TestComponent {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail if "host" metadata property is used in @Directive', () => {
      const source = `
        @Directive({
          host: [
          ~~~~~~~
            class: 'my-class',
            [type]: 'test',
            '(click)': 'bar()'
          ],
          ~
          selector: 'app-test'
        })
        class TestDirective {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed if "host" metadata property is not used in @Component', () => {
      const source = `
        @Component({
          selector: 'app-test',
          template: 'Hello'
        })
        class TestComponent {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if "host" metadata property is not used in Directive', () => {
      const source = `
        @Directive({
          selector: 'app-test'
        })
        class TestDirective {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
