import { expect } from 'chai';
import { Replacement } from 'tslint/lib';
import { getFailureMessage, Rule } from '../src/importDestructuringSpacingRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when a single import has no spaces', () => {
      const source = `
        import {Foo} from './foo'
               ~~~~~
      `;
      assertAnnotated({
        message: getFailureMessage(),
        ruleName,
        source
      });
    });

    it('should fail when multiple imports have no spaces', () => {
      const source = `
      import {Foo,Bar} from './foo'
             ~~~~~~~~~
      `;
      assertAnnotated({ message: getFailureMessage(), ruleName, source });
    });

    it('should fail when there are no trailing spaces', () => {
      const source = `
        import { Foo} from './foo';
               ~~~~~~
      `;
      assertAnnotated({
        message: getFailureMessage(),
        ruleName,
        source
      });
    });

    it('should fail when there are no leading spaces', () => {
      const source = `
        import {Foo } from './foo';
               ~~~~~~
      `;
      assertAnnotated({
        message: getFailureMessage(),
        ruleName,
        source
      });
    });
  });

  describe('failure with replacements', () => {
    it('should fail and apply proper replacements when there are no spaces', () => {
      const source = `
        import {Foo} from './foo';
               ~~~~~
      `;
      const failures = assertAnnotated({ message: getFailureMessage(), ruleName, source });

      if (!Array.isArray(failures)) {
        return;
      }

      const replacement = Replacement.applyFixes(source, failures.map(f => f.getFix()!));

      expect(replacement).to.eq(`
        import { Foo } from './foo';
               ~~~~~
      `);
    });

    it('should fail and apply proper replacements when there is more than one leading space', () => {
      const source = `
        import {     Bar, BarFoo, Foo } from './foo';
               ~~~~~~~~~~~~~~~~~~~~~~~~
      `;
      const failures = assertAnnotated({ message: getFailureMessage(), ruleName, source });

      if (!Array.isArray(failures)) {
        return;
      }

      const replacement = Replacement.applyFixes(source, failures.map(f => f.getFix()!));

      expect(replacement).to.eq(`
        import { Bar, BarFoo, Foo } from './foo';
               ~~~~~~~~~~~~~~~~~~~~~~~~
      `);
    });

    it('should fail and apply proper replacements when there is more than one trailing space', () => {
      const source = `
        import { Bar, BarFoo, Foo     } from './foo';
               ~~~~~~~~~~~~~~~~~~~~~~~~
      `;
      const failures = assertAnnotated({ message: getFailureMessage(), ruleName, source });

      if (!Array.isArray(failures)) {
        return;
      }

      const replacement = Replacement.applyFixes(source, failures.map(f => f.getFix()!));

      expect(replacement).to.eq(`
        import { Bar, BarFoo, Foo } from './foo';
               ~~~~~~~~~~~~~~~~~~~~~~~~
      `);
    });

    it('should fail and apply proper replacements when there is more than one space left and right', () => {
      const source = `
        import {     Bar, BarFoo, Foo     } from './foo';
               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `;
      const failures = assertAnnotated({ message: getFailureMessage(), ruleName, source });

      if (!Array.isArray(failures)) {
        return;
      }

      const replacement = Replacement.applyFixes(source, failures.map(f => f.getFix()!));

      expect(replacement).to.eq(`
        import { Bar, BarFoo, Foo } from './foo';
               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `);
    });
  });

  describe('success', () => {
    it('should succeed with valid spacing', () => {
      const source = `
        import { Foo } from './foo';
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed with multiple spaces between imports', () => {
      const source = `
        import { Bar,    Foo } from './foo';
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed for blank imports', () => {
      const source = `
        import {} from 'foo';
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed for module imports', () => {
      const source = `
        import foo = require('./foo');
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed for patch imports', () => {
      const source = `
        import 'rxjs/add/operator/map';
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed with alias imports', () => {
      const source = `
        import * as Foo from './foo';
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed for alias imports inside braces', () => {
      const source = `
        import { default as _rollupMoment, Moment } from 'moment';
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed for multiline imports', () => {
      const source = `
        import {
          Bar,
          BarFoo,
          Foo
        } from './foo';
      `;
      assertSuccess(ruleName, source);
    });
  });
});
