import { Rule } from '../src/templateNoNegatedAsyncRule';
import { assertAnnotated, assertMultipleAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING_NEGATED_PIPE,
  FAILURE_STRING_UNSTRICT_EQUALITY,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if async pipe is negated', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '{{ !(foo | async) }}'
                        ~~~~~~~~~~~~~~~
        })
        class Test {
          constructor(foo: Observable<Boolean>) {}
        }
      `;
      assertAnnotated({
        message: FAILURE_STRING_NEGATED_PIPE,
        ruleName,
        source,
      });
    });

    it('should fail if async pipe is the last pipe in the negated chain', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '{{ !(foo | somethingElse | async) }}'
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {
          constructor(foo: Observable<Boolean>) {}
        }
      `;
      assertAnnotated({
        message: FAILURE_STRING_NEGATED_PIPE,
        ruleName,
        source,
      });
    });

    it('should fail if async pipe uses unstrict equality', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '{{ (foo | async) == false }}'
                         ~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {
          constructor(foo: Observable<Boolean>) {}
        }
      `;
      assertAnnotated({
        message: FAILURE_STRING_UNSTRICT_EQUALITY,
        ruleName,
        source,
      });
    });

    it('should fail if async pipe is negated using *ngIf', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '<div *ngIf="!(a | async)"></div>'
                                 ~~~~~~~~~~~~
        })
        class Test {
          constructor(foo: Observable<Boolean>) {}
        }
      `;
      assertAnnotated({
        message: FAILURE_STRING_NEGATED_PIPE,
        ruleName,
        source,
      });
    });

    it('should fail for multiple negated/unstrict equality async pipes', () => {
      const source = `
        @Component({
          selector: 'test',
          template: \`
            <div *ngFor="let elem of [1, 2, 3]; trackBy: trackByFn">
              {{ elem }}
            </div>

            <div *ngIf="!(foo | async)">
                        ~~~~~~~~~~~~~~
              {{ (foo | async) == false }}
                  ^^^^^^^^^^^^^^^^^^^^^^
              <div *ngIf="(foo | async) == false">
                           #####################
                works!
              </div>
            </div>
          \`
        })
        class Test {
          constructor(foo: Observable<Boolean>) {}
        }
      `;
      assertMultipleAnnotated({
        failures: [
          {
            char: '~',
            msg: FAILURE_STRING_NEGATED_PIPE,
          },
          {
            char: '^',
            msg: FAILURE_STRING_UNSTRICT_EQUALITY,
          },
          {
            char: '#',
            msg: FAILURE_STRING_UNSTRICT_EQUALITY,
          },
        ],
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed if async pipe is not negated', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '{{ (foo | async) }}'
        })
        class Test {
          constructor(foo: Observable<Boolean>) {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if async pipe is not the last pipe in the negated chain', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '{{ !(foo | async | somethingElse) }}'
        })
        class Test {
          constructor(foo: Observable<Boolean>) {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if async pipe uses strict equality', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '{{ (foo | async) === false }}'
        })
        class Test {
          constructor(foo: Observable<Boolean>) {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if any other pipe is negated', () => {
      const source = `
        @Component({
          selector: 'test',
          template: '{{ !(foo | notAnAsyncPipe) }}'
        })
        class Test {
          constructor(foo: Observable<Boolean>) {}
        }
      `;
      assertSuccess(ruleName, source);
    });
  });
});
