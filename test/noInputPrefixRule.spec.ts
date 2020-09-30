import { getFailureMessage, Rule } from '../src/noInputPrefixRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when an input property is prefixed by a blacklisted prefix and blacklist is composed by one prefix', () => {
      const blacklistedPrefixes = ['is'];
      const source = `
        @Directive()
        class Test {
          @Input() isDisabled: boolean;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({
        message: getFailureMessage(blacklistedPrefixes),
        options: blacklistedPrefixes,
        ruleName,
        source,
      });
    });

    it('should fail when an input property is strictly equal to a blacklisted prefix', () => {
      const blacklistedPrefixes = ['should'];
      const source = `
        @Directive()
        class Test {
          @Input() should: boolean;
          ~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({
        message: getFailureMessage(blacklistedPrefixes),
        options: blacklistedPrefixes,
        ruleName,
        source,
      });
    });

    it('should fail when an input property is prefixed by a blacklisted prefix and blacklist is composed by two blacklistedPrefixes', () => {
      const blacklistedPrefixes = ['can', 'is'];
      const source = `
        @Component()
        class Test {
          @Input() canEnable: boolean;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({
        message: getFailureMessage(blacklistedPrefixes),
        options: blacklistedPrefixes,
        ruleName,
        source,
      });
    });

    it('should fail when an input property is prefixed by a blacklisted prefix and blacklist is composed by two concurrent blacklistedPrefixes', () => {
      const blacklistedPrefixes = ['is', 'isc'];
      const source = `
        @Component()
        class Test {
          @Input() iscHange: boolean;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({
        message: getFailureMessage(blacklistedPrefixes),
        options: blacklistedPrefixes,
        ruleName,
        source,
      });
    });

    it('should fail when an input property is snakecased and contains a blacklisted prefix', () => {
      const blacklistedPrefixes = ['do'];
      const source = `
        @Directive()
        class Test {
          @Input() do_it: number;
          ~~~~~~~~~~~~~~~~~~~~~~~
        }
      `;
      assertAnnotated({
        message: getFailureMessage(blacklistedPrefixes),
        options: blacklistedPrefixes,
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed when an input property is not prefixed', () => {
      const blacklistedPrefixes = ['must'];
      const source = `
        @Directive()
        class Test {
          @Input() mustmust = true;
        }
      `;
      assertSuccess(ruleName, source, blacklistedPrefixes);
    });

    it('should succeed when multiple input properties are prefixed by something not present in the blacklist', () => {
      const blacklistedPrefixes = ['can', 'dis', 'disable', 'should'];
      const source = `
        @Component()
        class Test {
          @Input() cana: string;
          @Input() disabledThing: boolean;
          @Input() isFoo = 'yes';
          @Input() shoulddoit: boolean;
        }
      `;
      assertSuccess(ruleName, source, blacklistedPrefixes);
    });
  });
});
