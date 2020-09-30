import { Rule } from '../src/useInjectableProvidedInRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
  FAILURE_STRING,
} = Rule;

describe(ruleName, () => {
  describe('failures', () => {
    it('should fail if providedIn property is not set', () => {
      const source = `
        @Injectable()
        ~~~~~~~~~~~~~
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
    it('should succeed if providedIn property is set to a literal string', () => {
      const source = `
        @Injectable({
          providedIn: 'root'
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if providedIn property is set to a module', () => {
      const source = `
        @Injectable({
          providedIn: SomeModule
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
