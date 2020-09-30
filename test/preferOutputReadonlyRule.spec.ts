import { assertAnnotated, assertSuccess } from './testHelper';

const ruleName = 'prefer-output-readonly';

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when an @Output is not readonly', () => {
      const source = `
        class Test {
          @Output() testEmitter = new EventEmitter<string>();
                    ~~~~~~~~~~~
        }
      `;
      assertAnnotated({
        ruleName,
        message: 'Prefer to declare `@Output` as readonly since they are not supposed to be reassigned',
        source,
      });
    });
  });

  describe('success', () => {
    it('should pass when an @Output is readonly', () => {
      const source = `
        class Test {
          @Output() readonly testEmitter = new EventEmitter<string>();
        }
      `;
      assertSuccess(ruleName, source);
    });
  });
});
