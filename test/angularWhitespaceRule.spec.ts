import { assertSuccess, assertAnnotated } from './testHelper';
import { Replacement } from 'tslint';
import { expect } from 'chai';

describe('angular-whitespace', () => {
  describe('success', () => {

    describe('interpolation check', () => {
      it('should work with proper style', () => {
        let source = `
        @Component({
          template: \`
            <div>{{ foo }}</div>
          \`
        })
        class Bar {}
        `;
        assertSuccess('angular-whitespace', source, ['check-interpolation']);
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
        assertSuccess('angular-whitespace', source, ['check-interpolation']);
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
        assertSuccess('angular-whitespace', source, ['check-interpolation']);
      });
    });

    describe('pipe check', () => {
      it('should succeed with proper style', () => {
        let source = `
        @Component({
          selector: 'foo',
          template: \`
            <div>{{ foo | async }}</div>
          \`
        })
        class Bar {
          foo: any;
        }
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });
    });
  });

  describe('failure', () => {

    describe('interpolation', () => {
      it('should fail when no space', () => {
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
          source,
          options: ['check-interpolation']
        });
      });

      describe('replacements', () => {
        it('should fail and apply proper replacements when style is incorrect', () => {
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
            source,
            options: ['check-interpolation']
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
            source,
            options: ['check-interpolation']
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

  });

  describe('pipes', () => {
    it('should fail when extra space after "|"', () => {
      let source = `
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo |  async }}</div>
                     ~~~
        \`
      })
      class Bar {
        foo: any;
      }
      `;
      const failures = assertAnnotated({
        ruleName: 'angular-whitespace',
        message: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".',
        source,
        options: ['check-pipe']
      });

      const res = Replacement.applyAll(source, failures[0].getFix());
      expect(res).to.eq(`
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo | async }}</div>
                     ~~~
        \`
      })
      class Bar {
        foo: any;
      }
      `);
    });

    it('should fail when extra space on both sides', () => {
      let source = `
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo  |  async }}</div>
                      ~~~
        \`
      })
      class Bar {
        foo: any;
      }
      `;
      const failures = assertAnnotated({
        ruleName: 'angular-whitespace',
        message: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".',
        source,
        options: ['check-pipe']
      });

      const res = Replacement.applyAll(source, failures[0].getFix());
      expect(res).to.eq(`
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo | async }}</div>
                      ~~~
        \`
      })
      class Bar {
        foo: any;
      }
      `);
    });

    it('should fail when extra space on both sides', () => {
      let source = `
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo + 1   |   async }}</div>
                           ~~~
        \`
      })
      class Bar {
        foo: any;
      }
      `;
      const failures = assertAnnotated({
        ruleName: 'angular-whitespace',
        message: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".',
        source,
        options: ['check-pipe']
      });

      const res = Replacement.applyAll(source, failures[0].getFix());
      expect(res).to.eq(`
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo + 1 | async }}</div>
                           ~~~
        \`
      })
      class Bar {
        foo: any;
      }
      `);
    });

    it('should fail when no space', () => {
      let source = `
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo + 1|async }}</div>
                        ~~~
        \`
      })
      class Bar {
        foo: any;
      }
      `;
      const failures = assertAnnotated({
        ruleName: 'angular-whitespace',
        message: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".',
        source,
        options: ['check-pipe']
      });

      const res = Replacement.applyAll(source, failures[0].getFix());
      expect(res).to.eq(`
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo + 1 | async }}</div>
                        ~~~
        \`
      })
      class Bar {
        foo: any;
      }
      `);
    });

    it('should fail when no space in property binding', () => {
      let source = `
      @Component({
        selector: 'foo',
        template: \`
          <div [class]="foo|bar"></div>
                          ~~~
        \`
      })
      class Bar {
        foo: any;
      }
      `;
      const failures = assertAnnotated({
        ruleName: 'angular-whitespace',
        message: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".',
        source,
        options: ['check-pipe']
      });

      const res = Replacement.applyAll(source, failures[0].getFix());
      expect(res).to.eq(`
      @Component({
        selector: 'foo',
        template: \`
          <div [class]="foo | bar"></div>
                          ~~~
        \`
      })
      class Bar {
        foo: any;
      }
      `);
    });
  });

});
