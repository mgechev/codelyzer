import { getFailureMessage, Rule } from '../src/noInputPrefixRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;
const className = 'Test';

const getFailureAnnotations = (num: number): string => {
  return '~'.repeat(num);
};

const getComposedOptions = (prefixes: string[]): (boolean | string)[] => {
  return [true, ...prefixes];
};

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when an input property is prefixed by a blacklisted prefix and blacklist is composed by one prefix', () => {
      const prefixes = ['is'];
      const propertyName = `${prefixes[0]}Disabled`;
      const inputExpression = `@Input() ${propertyName}: boolean;`;
      const source = `
        @Directive()
        class ${className} {
          ${inputExpression}
          ${getFailureAnnotations(inputExpression.length)}
        }
      `;
      assertAnnotated({
        message: getFailureMessage(className, propertyName, prefixes),
        options: getComposedOptions(prefixes),
        ruleName,
        source
      });
    });

    it('should fail when an input property is prefixed by a blacklisted prefix and blacklist is composed by two prefixes', () => {
      const prefixes = ['can', 'is'];
      const propertyName = `${prefixes[0]}Enable`;
      const inputExpression = `@Input() ${propertyName}: boolean;`;
      const source = `
        @Component()
        class ${className} {
          ${inputExpression}
          ${getFailureAnnotations(inputExpression.length)}
        }
      `;
      assertAnnotated({
        message: getFailureMessage(className, propertyName, prefixes),
        options: getComposedOptions(prefixes),
        ruleName,
        source
      });
    });

    it('should fail when an input property is prefixed by a blacklisted prefix and blacklist is composed by two concurrent prefixes', () => {
      const prefixes = ['is', 'isc'];
      const propertyName = `${prefixes[1]}Hange`;
      const inputExpression = `@Input() ${propertyName}: boolean;`;
      const source = `
        @Component()
        class ${className} {
          ${inputExpression}
          ${getFailureAnnotations(inputExpression.length)}
        }
      `;
      assertAnnotated({
        message: getFailureMessage(className, propertyName, prefixes),
        options: getComposedOptions(prefixes),
        ruleName,
        source
      });
    });

    it('should fail when an input property is snakecased and contains a blacklisted prefix', () => {
      const prefixes = ['do'];
      const propertyName = `${prefixes[0]}_it`;
      const inputExpression = `@Input() ${propertyName}: number;`;
      const source = `
        @Directive()
        class ${className} {
          ${inputExpression}
          ${getFailureAnnotations(inputExpression.length)}
        }
      `;
      assertAnnotated({
        message: getFailureMessage(className, propertyName, prefixes),
        options: getComposedOptions(prefixes),
        ruleName,
        source
      });
    });
  });

  describe('success', () => {
    it('should succeed when an input property is not prefixed', () => {
      const source = `
        @Directive()
        class ${className} {
          @Input() mustmust = true;
        }
      `;
      assertSuccess(ruleName, source, getComposedOptions(['must']));
    });

    it('should succeed when multiple input properties are prefixed by something not present in the blacklist', () => {
      const source = `
        @Component()
        class ${className} {
          @Input() cana: string;
          @Input() disabledThing: boolean;
          @Input() isFoo = 'yes';
          @Input() shoulddoit: boolean;
        }
      `;
      assertSuccess(ruleName, source, getComposedOptions(['can', 'should', 'dis', 'disable']));
    });
  });
});
