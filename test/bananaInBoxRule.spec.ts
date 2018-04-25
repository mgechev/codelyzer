import { assertSuccess, assertAnnotated } from './testHelper';
import { Replacement } from 'tslint';
import { expect } from 'chai';

describe('banana-in-box', () => {
  describe('success', () => {
    it('should work with proper style', () => {
      let source = `
        @Component({
          template: \`  <input type="text" [(ngModel)]="foo" name="foo">  \`
        })
        class Bar {}
      `;
      assertSuccess('banana-in-box', source);
    });

    it('should work with proper style', () => {
      let source = `
        @Component({
          template: \`  <a (click)="navigate(['/resources'])"> \`
        })
        class Bar {}
      `;
      assertSuccess('banana-in-box', source);
    });
  });

  describe('failure', () => {
    it('should fail when the box is in the banana', () => {
      let source = `
        @Component({
          template: \` <input type="text" ([ngModel])="foo" name="foo">
                                          ~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'banana-in-box',
        message: 'Invalid binding syntax. Use [(expr)] instead',
        source
      });
    });

    it('should fail when the box is in the banana', () => {
      let source = `
        @Component({
          template: \` <comp ([bar])="foo" name="foo"></comp>
                             ~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'banana-in-box',
        message: 'Invalid binding syntax. Use [(expr)] instead',
        source
      });
    });
  });

  describe('replacements', () => {
    it('should fail when the box is in the banana', () => {
      let source = `
        @Component({
          template: \` <input type="text" ([ngModel])="foo" name="foo">
                                          ~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `;
      const failures = assertAnnotated({
        ruleName: 'banana-in-box',
        message: 'Invalid binding syntax. Use [(expr)] instead',
        source
      });

      const res = Replacement.applyAll(source, failures[0].getFix());
      expect(res).to.eq(`
        @Component({
          template: \` <input type="text" [(ngModel)]="foo" name="foo">
                                          ~~~~~~~~~~~~~~~~~
          \`
        })
        class Bar {}
      `);
    });
  });
});
