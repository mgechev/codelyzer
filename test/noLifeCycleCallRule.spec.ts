import { lifecycleHooksMethods, LifecycleHooksMethods } from '../src/noLifeCycleCallRule';
import { assertAnnotated, assertSuccess } from './testHelper';

type Metadata = 'Component' | 'Directive' | 'Injectable' | 'Pipe';

type MetadataPair = { [key in Metadata]: typeof lifecycleHooksMethods };

type MetadataFakePair = { [key in Metadata]?: Set<string> };

const className = 'Test';
const ruleName = 'no-life-cycle-call';
const metadataPairs: MetadataPair = {
  Component: lifecycleHooksMethods,
  Directive: lifecycleHooksMethods,
  Injectable: new Set<LifecycleHooksMethods>(['ngOnDestroy']),
  Pipe: new Set<LifecycleHooksMethods>(['ngOnDestroy'])
};

const metadataKeys = Object.keys(metadataPairs);
const prefix = 'prefix';
const suffix = 'Suffix';
const metadataFakePairs: MetadataFakePair = {};
for (const metadataKey of metadataKeys) {
  metadataFakePairs[metadataKey] = new Set<string>();

  metadataPairs[metadataKey].forEach(lifecycleHookMethod => {
    metadataFakePairs[metadataKey]
      .add(`${prefix}${lifecycleHookMethod}`)
      .add(`${lifecycleHookMethod}${suffix}`)
      .add(`${prefix}${lifecycleHookMethod}${suffix}`);
  });
}

describe(ruleName, () => {
  describe('failure', () => {
    for (const metadataKey of metadataKeys) {
      describe(metadataKey, () => {
        metadataPairs[metadataKey].forEach(lifecycleHookMethod => {
          const lifecycleHookMethodCall = `this.${lifecycleHookMethod}()`;
          const totalTildes = '~'.repeat(lifecycleHookMethodCall.length);
          const source = `
            @${metadataKey}()
            class ${className} implements ${lifecycleHookMethod.slice(2)} {
              ${lifecycleHookMethod}() {}

              ${className.toLowerCase()}() {
                ${lifecycleHookMethodCall}
                ${totalTildes}
              }
            }
          `;

          it(`should fail when explicitly calling ${lifecycleHookMethodCall}`, () => {
            assertAnnotated({
              ruleName,
              message: 'Avoid explicit calls to lifecycle hooks.',
              source
            });
          });
        });
      });
    }

    lifecycleHooksMethods.forEach(lifecycleHookMethod => {
      const lifecycleHookMethodCall = `fixture.componentInstance.${lifecycleHookMethod}()`;
        const totalTildes = '~'.repeat(lifecycleHookMethodCall.length);
        const source = `
          it('should work', () => {
            // test code...

            ${lifecycleHookMethodCall}
            ${totalTildes}

            // more test code...
          })
        `;

      it(`should fail when explicitly calling ${lifecycleHookMethod} outside of a class`, () => {
        assertAnnotated({
          ruleName,
          message: `Avoid explicit calls to lifecycle hooks.`,
          source
        });
      });
    });
  });

  describe('success', () => {
    for (const metadataKey of metadataKeys) {
      describe(metadataKey, () => {
        metadataFakePairs[metadataKey].forEach(fakeMethod => {
          const source = `
            @${metadataKey}()
            class ${className} {
              ${fakeMethod}() {}

              ${className.toLowerCase()}() {
                this.${fakeMethod}();
              }
            }
          `;

          it(`should pass when calling ${fakeMethod} method`, () => {
            assertSuccess(ruleName, source);
          });
        });
      });
    }

    // call super lifecycle hook
    for (const metadataKey of metadataKeys) {
      describe(metadataKey, () => {
        metadataPairs[metadataKey].forEach(lifecycleHookMethod => {
          const lifecycleHookMethodCall = `super.${lifecycleHookMethod}()`;
          const source = `
            @${metadataKey}()
            class ${className} implements ${lifecycleHookMethod.slice(2)} {
              ${lifecycleHookMethod}() {
                ${lifecycleHookMethodCall}
              }
            }
          `;

          it(`should pass when explicitly calling ${lifecycleHookMethodCall}`, () => {
            assertSuccess(ruleName, source);
          });
        });
      });
    }
  });
});
