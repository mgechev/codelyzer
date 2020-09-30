import { Rule } from '../src/useComponentViewEncapsulationRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if ViewEncapsulation.None is set', () => {
      const source = `
        @Component({
          encapsulation: ViewEncapsulation.None,
                         ~~~~~~~~~~~~~~~~~~~~~~
          selector: 'app-foo-bar',
        })
        export class Test {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed if ViewEncapsulation.Emulated is set', () => {
      const source = `
        @Component({
          encapsulation: ViewEncapsulation.Emulated,
          selector: 'app-foo-bar'
        })
        export class Test {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if ViewEncapsulation.Native is set', () => {
      const source = `
        @Component({
          encapsulation: ViewEncapsulation.Native,
          selector: 'app-foo-bar'
        })
        export class Test {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if ViewEncapsulation.ShadowDom is set', () => {
      const source = `
        @Component({
          encapsulation: ViewEncapsulation.ShadowDom,
          selector: 'app-foo-bar'
        })
        export class Test {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if no ViewEncapsulation is explicitly set', () => {
      const source = `
        @Component({
          selector: 'app-foo-bar'
        })
        export class Test {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if no component is defined', () => {
      const source = `
        @NgModule({
          bootstrap: [Foo]
        })
        export class Test {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
