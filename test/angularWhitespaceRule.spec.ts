import { assertSuccess, assertAnnotated } from './testHelper';
import { Replacement } from 'tslint';
import { expect } from 'chai';

describe('angular-whitespace', () => {
  describe('success', () => {
    it('should work with proper style', () => {
      let source = `
      @Component({
        template: \`
          <div>{{ foo }}</div>
        \`
      })
      class Bar {}
      `;
      assertSuccess('angular-whitespace', source);
    });

    it('should work with proper style and complex expressions', () => {
      let source = `
      @Component({
        template: \`
          <div>{{ foo + bar | pipe }}</div>
        \`
      })
      class Bar {}
      `;
      assertSuccess('angular-whitespace', source);
    });

    it('should work with properties', () => {
      let source = `
      @Component({
        template: \`
          <input [value]="  {{ foo }}">
        \`
      })
      class Bar {}
      `;
      assertSuccess('angular-whitespace', source);
    });
  });

  describe('failure', () => {
    it('should not fail when no decorator is set', () => {
      let source = `
      @Component({
        template: \`
          <div>{{foo}}</div>
               ~~~~~~~
        \`
      })
      class Bar {}
      `;
      assertAnnotated({
        ruleName: 'angular-whitespace',
        message: 'Missing whitespace in interpolation; expecting {{ expr }}',
        source
      });
    });
  });

  describe('replacements', () => {
    it('fixes negated pipes', () => {
      let source = `
      @Component({
        template: \`
          <div>  {{foo}}   </div>
                 ~~~~~~~
        \`
      })
      class Bar {}`;
      const failures =  assertAnnotated({
        ruleName: 'angular-whitespace',
        message: 'Missing whitespace in interpolation; expecting {{ expr }}',
        source
      });

      const res = Replacement.applyAll(source, failures[0].getFix());
      expect(res).to.eq(`
      @Component({
        template: \`
          <div>  {{ foo }}   </div>
                 ~~~~~~~
        \`
      })
      class Bar {}`);
    });

    it('should remove extra spaces', () => {
      let source = `
      @Component({
        template: \`
          <div>{{  foo    }}</div>
               ~~~~~~~~~~~~~
        \`
      })
      class Bar {}`;
      const failures =  assertAnnotated({
        ruleName: 'angular-whitespace',
        message: 'Extra whitespace in interpolation; expecting {{ expr }}',
        source
      });

      const res = Replacement.applyAll(source, failures[0].getFix());
      expect(res).to.eq(`
      @Component({
        template: \`
          <div>{{ foo }}</div>
               ~~~~~~~~~~~~~
        \`
      })
      class Bar {}`);
    });
  });
});

