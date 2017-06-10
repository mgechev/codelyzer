import { assertSuccess, assertAnnotated } from './testHelper';
import { Replacement } from 'tslint';
import { expect } from 'chai';

describe('templates-no-negated-async', () => {
  describe('invalid expressions', () => {
    it('should fail when an async pipe is negated', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '{{ !(foo | async) }}'
                        ~~~~~~~~~~~~~~~
        })
        class Test {
          constructor(public foo: Observable<Boolean>) {}
        }`;
        assertAnnotated({
          ruleName: 'templates-no-negated-async',
          message: 'Async pipes can not be negated, use (observable | async) === false instead',
          source
        });
    });

    it('should fail when an async pipe is including other pipes', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '{{ !(foo | somethingElse | async) }}'
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {
          constructor(public foo: Observable<Boolean>) {}
        }`;
        assertAnnotated({
          ruleName: 'templates-no-negated-async',
          message: 'Async pipes can not be negated, use (observable | async) === false instead',
          source
        });
    });

    it('should fail when an async pipe uses non-strict equality', () => {
      let source = `
      @Component({
        selector: 'foobar',
        template: '{{ (foo | async) == false }}'
                       ~~~~~~~~~~~~~~~~~~~~~~
      })
      class Test {
        constructor(public foo: Observable<Boolean>) {}
      }`;
      assertAnnotated({
        ruleName: 'templates-no-negated-async',
        message: 'Async pipes must use strict equality `===` when comparing with `false`',
        source
      });
    });

    describe('fixes', () => {
      it('fixes negated pipes', () => {
        let source = `
        @Component({
          selector: 'foobar',
          template: '{{ !(foo | async) }}'
                        ~~~~~~~~~~~~~~~
        })
        class Test {}`;
        const failures =  assertAnnotated({
          ruleName: 'templates-no-negated-async',
          message: 'Async pipes can not be negated, use (observable | async) === false instead',
          source
        });

        const res = Replacement.applyAll(source, failures[0].getFix());
        expect(res).to.eq(`
        @Component({
          selector: 'foobar',
          template: '{{ (foo | async) === false }}'
                        ~~~~~~~~~~~~~~~
        })
        class Test {}`);
      });

      it('fixes un-strict equality', () => {
        let source = `
        @Component({
          selector: 'foobar',
          template: '{{ (foo | async) == false }}'
                         ~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {}`;
        const failures =  assertAnnotated({
          ruleName: 'templates-no-negated-async',
          message: 'Async pipes must use strict equality `===` when comparing with `false`',
          source
        });

        const res = Replacement.applyAll(source, failures[0].getFix());
        expect(res).to.eq(`
        @Component({
          selector: 'foobar',
          template: '{{ (foo | async) === false }}'
                         ~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {}`);
      });
    });
  });

  describe('valid expressions', () => {
    it('should succeed if an async pipe is not negated', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '{{ (foo | async) }}'
        })
        class Test {
          constructor(public foo: Observable<Boolean>) {}
        }`;
        assertSuccess('templates-no-negated-async', source);
    });

    it('should succeed if an async pipe is not the last pipe in the negated chain', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '{{ !(foo | async | someOtherFilter) }}'
        })
        class Test {
          constructor(public foo: Observable<Boolean>) {}
        }`;
        assertSuccess('templates-no-negated-async', source);
    });

    it('should succeed if an async pipe uses strict equality', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '{{ (foo | async) === false }}'
        })
        class Test {
          constructor(public foo: Observable<Boolean>) {}
        }`;
        assertSuccess('templates-no-negated-async', source);
    });

    it('should succeed if any other pipe is negated', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '{{ !(foo | notAnAsyncPipe) }}'
        })
        class Test {
          constructor(public foo: Observable<Boolean>) {}
        }`;
        assertSuccess('templates-no-negated-async', source);
    });
  });
});
