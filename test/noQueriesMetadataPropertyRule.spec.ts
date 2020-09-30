import { Rule } from '../src/noQueriesMetadataPropertyRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if "queries" metadata property is used in @Component', () => {
      const source = `
        @Component({
          queries: [
          ~~~~~~~~~~
            contentChild: new ContentChild(ChildDirective),
            contentChildren: new ContentChildren(ChildDirective),
            viewChild: new ViewChild(ChildDirective),
            viewChildren: new ViewChildren(ChildDirective)
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

    it('should fail if "queries" metadata property is used in @Directive', () => {
      const source = `
        @Directive({
          queries: [
          ~~~~~~~~~
            contentChild: new ContentChild(ChildDirective),
            contentChildren: new ContentChildren(ChildDirective),
            viewChild: new ViewChild(ChildDirective),
            viewChildren: new ViewChildren(ChildDirective)
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
    it('should succeed if "queries" metadata property is not used in @Component', () => {
      const source = `
        @Component({
          selector: 'app-test',
          template: 'Hello'
        })
        class TestComponent {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if "queries" metadata property is not used in Directive', () => {
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
