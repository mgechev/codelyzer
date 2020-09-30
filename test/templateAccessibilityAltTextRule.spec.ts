import { getFailureMessage, Rule } from '../src/templateAccessibilityAltTextRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail image does not have alt text', () => {
      const source = `
        @Component({
          template: \`
            <img src="foo">
            ~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: getFailureMessage('img'),
        ruleName,
        source,
      });
    });

    it('should fail when object does not have alt text or labels', () => {
      const source = `
        @Component({
          template: \`
            <object></object>
            ~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: getFailureMessage('object'),
        ruleName,
        source,
      });
    });

    it('should fail when area does not have alt or label text', () => {
      const source = `
        @Component({
          template: \`
            <area></area>
            ~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: getFailureMessage('area'),
        ruleName,
        source,
      });
    });

    it('should fail when input element with type image does not have alt or text image', () => {
      const source = `
        @Component({
          template: \`
            <input type="image"></input>
            ~~~~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: getFailureMessage('input'),
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should work with img with alternative text', () => {
      const source = `
        @Component({
          template: \`
            <img src="foo" alt="Foo eating a sandwich.">
            <img src="foo" [attr.alt]="altText">
            <img src="foo" [attr.alt]="'Alt Text'">
            <img src="foo" alt="">
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should work with object having label, title or meaningful description', () => {
      const source = `
        @Component({
          template: \`
            <object aria-label="foo">
            <object aria-labelledby="id1">
            <object>Meaningful description</object>
            <object title="An object">
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should work with area having label or alternate text', () => {
      const source = `
        @Component({
          template: \`
            <area aria-label="foo"></area>
            <area aria-labelledby="id1"></area>
            <area alt="This is descriptive!"></area>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should work with input type image having alterate text and labels', () => {
      const source = `
        @Component({
          template: \`
            <input type="text">
            <input type="image" alt="This is descriptive!">
            <input type="image" aria-label="foo">
            <input type="image" aria-labelledby="id1">
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
