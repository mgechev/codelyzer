import { Rule } from '../src/noAttributeDecoratorRule';
import { assertAnnotated, assertMultipleAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if @Attribute decorator is used', () => {
      const source = `
        class Test {
          label: string;

          constructor(@Attribute('label') label) {
                      ~~~~~~~~~~~~~~~~~~~
            this.label = label;
          }
        }
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail if @Attribute decorator is used in a class expression', () => {
      const source = `
        class Test {
          private count = 0;

          InnerTestClass = new class {
            constructor(@Attribute('label') label: string) {}
                        ~~~~~~~~~~~~~~~~~~~
          }(this);
        }
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail if @Attribute decorator is used in a property class declaration', () => {
      const source = `
        class Test {
          static InnerTestClass = class extends TestCase {
            constructor(@Attribute('label') label: string) {}
                        ~~~~~~~~~~~~~~~~~~~
          };
        }
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail if multiple @Attribute decorators are used', () => {
      const source = `
        class Test {
          constructor(@Attribute('label') label: string) {
                      ~~~~~~~~~~~~~~~~~~~
          }

          InnerTest1 = new class {
            constructor(@Attribute('label') label: string) {}
                        ^^^^^^^^^^^^^^^^^^^
          }(this);

          static InnerTestClass2 = class extends TestCase {
            constructor(@Attribute('label') label: string) {}
                        ###################
          };
        }
      `;
      assertMultipleAnnotated({
        failures: [
          {
            char: '~',
            msg: FAILURE_STRING,
          },
          {
            char: '^',
            msg: FAILURE_STRING,
          },
          {
            char: '#',
            msg: FAILURE_STRING,
          },
        ],
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed if no @Attribute decorator is used', () => {
      const source = `
        class Test {
          constructor(@Property('label') label: string) {}
        }
      `;
      assertSuccess(ruleName, source);
    });
  });
});
