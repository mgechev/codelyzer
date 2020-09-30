import { Rule } from '../src/templateNoAnyRule';
import { assertAnnotated, assertMultipleAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail with call expression in expression binding', () => {
      const source = `
        @Component({
          template: '{{ $any(framework).name }}'
                        ~~~~~~~~~~~~~~~
        })
        export class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail with call expression using "this"', () => {
      const source = `
        @Component({
          template: '{{ this.$any(framework).name }}'
                        ~~~~~~~~~~~~~~~~~~~~
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail with call expression in property binding', () => {
      const source = `
        @Component({
          template: '<a [href]="$any(getHref())">Click here</a>'
                                ~~~~~~~~~~~~~~~
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail with call expression in an output handler', () => {
      const source = `
        @Component({
          template: '<button type="button" (click)="$any(this).member = 2">Click here</button>'
                                                    ~~~~~~~~~~
        })
        class Bar {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail for multiple cases', () => {
      const source = `
        @Component({
          template: \`
            {{ $any(framework).name }}
               ~~~~~~~~~~~~~~~
            {{ this.$any(framework).name }}
               ^^^^^^^^^^^^^^^^^^^^
            <a [href]="$any(getHref())">Click here</a>'
                       ###############
            <button type="button" (click)="$any(this).member = 2">Click here</button>
                                           %%%%%%%%%%
          \`
        })
        class Bar {}
      `;
      assertMultipleAnnotated({
        failures: [
          {
            char: '~',
            msg: FAILURE_STRING,
          },
          {
            char: '^',
            msg: FAILURE_STRING,
          },
          {
            char: '#',
            msg: FAILURE_STRING,
          },
          {
            char: '%',
            msg: FAILURE_STRING,
          },
        ],
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should pass with no call expression', () => {
      const source = `
        @Component({
          template: '{{ $any }}'
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass for an object containing a function called "$any"', () => {
      const source = `
        @Component({
          template: '{{ obj.$any() }}'
        })
        class Bar {
          readonly obj = {
            $any: () => '$any'
          };
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass for a nested object containing a function called "$any"', () => {
      const source = `
        @Component({
          template: '{{ obj?.x?.y!.z!.$any() }}'
        })
        class Bar {
          readonly obj: Partial<Xyz> = {
            x: {
              y: {
                z: {
                  $any: () => '$any'
                }
              }
            }
          };
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass with call expression in property binding', () => {
      const source = `
        @Component({
          template: '<a [href]="$test()">Click here</a>'
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass with call expression in an output handler', () => {
      const source = `
        @Component({
          template: '<button type="button" (click)="anyClick()">Click here</button>'
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass for multiple cases', () => {
      const source = `
        @Component({
          template: \`
            {{ $any }}
            {{ obj?.x?.y!.z!.$any() }}
            <a [href]="$test()">Click here</a>
            <button type="button" (click)="anyClick()">Click here</button>
          \`
        })
        class Bar {
          readonly obj: Partial<Xyz> = {
            x: {
              y: {
                z: {
                  $any: () => '$any'
                }
              }
            }
          };
        }
      `;
      assertSuccess(ruleName, source);
    });
  });
});
