import { Rule } from '../src/preferOnPushComponentChangeDetectionRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if ChangeDetectionStrategy.Default is set', () => {
      const source = `
        @Component({
          changeDetection: ChangeDetectionStrategy.Default
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail if no ChangeDetectionStrategy is explicitly set', () => {
      const source = `
        @Component({
        ~~~~~~~~~~~~
          selector: 'foo'
        })
        ~~
        class Test {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed if ChangeDetectionStrategy.OnPush is set', () => {
      const source = `
        @Component({
          changeDetection: ChangeDetectionStrategy.OnPush
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
