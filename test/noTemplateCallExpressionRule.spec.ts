import { assertSuccess, assertAnnotated } from './testHelper';
import { Replacement } from 'tslint';
import { expect } from 'chai';

describe('no-template-call-expression', () => {
  describe('success', () => {
    it('should pass with no call expression', () => {
      let source = `
      @Component({
        template: '{{info}}'
      })
      class Bar { }
      `;
      assertSuccess('no-template-call-expression', source);
    });

    it('should pass with call expression in an output handler', () => {
      let source = `
      @Component({
        template: '<button type="button" (click)="handleClick()">Click Here</button>'
      })
      class Bar { }
      `;
      assertSuccess('no-template-call-expression', source);
    });
  });


  describe('failure', () => {
    it('should fail with call expression in expression binding', () => {
      let source = `
      @Component({
        template: '<a href="http://example.com">{{getInfo()}}</a>'
                                                  ~~~~~~~~~
      })
      class Bar { }
      `;
      assertAnnotated({
        ruleName: 'no-template-call-expression',
        message: 'Call expressions are not allowed in templates except in output handlers.',
        source
      });
    });

    it('should fail with call expression in property binding', () => {
      let source = `
      @Component({
        template: '<a [href]="getUrl()">info</a>'
                              ~~~~~~~~
      })
      class Bar { }
      `;
      assertAnnotated({
        ruleName: 'no-template-call-expression',
        message: 'Call expressions are not allowed in templates except in output handlers.',
        source
      });
    });

    it('should fail with a property access call expression', () => {
      let source = `
      @Component({
        template: '<a [href]="helper.getUrl()">info</a>'
                              ~~~~~~~~~~~~~~~
      })
      class Bar { }
      `;
      assertAnnotated({
        ruleName: 'no-template-call-expression',
        message: 'Call expressions are not allowed in templates except in output handlers.',
        source
      });
    });
  });
});
