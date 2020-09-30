import { getFailureMessage, Rule } from '../src/useLifecycleInterfaceRule';
import { AngularLifecycleInterfaces, AngularLifecycleMethods } from '../src/util/utils';
import { assertAnnotated, assertFailures, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if lifecycle method is declared without implementing its interface', () => {
      const source = `
        class Test {
          ngOnInit() {
          ~~~~~~~~
          }
        }
      `;
      const message = getFailureMessage({
        interfaceName: AngularLifecycleInterfaces.OnInit,
        methodName: AngularLifecycleMethods.ngOnInit,
      });
      assertAnnotated({
        message,
        ruleName,
        source,
      });
    });

    it('should fail if one of the lifecycle methods is declared without implementing its interface', () => {
      const source = `
        class Test extends Component implements OnInit {
          ngOnInit() {}

          ngOnDestroy() {
          ~~~~~~~~~~~
          }
        }
      `;
      const message = getFailureMessage({
        interfaceName: AngularLifecycleInterfaces.OnDestroy,
        methodName: AngularLifecycleMethods.ngOnDestroy,
      });
      assertAnnotated({
        message,
        ruleName,
        source,
      });
    });

    it('should fail if lifecycle methods are declared without implementing their interfaces', () => {
      const source = `
        class Test {
          ngOnInit() {}

          ngOnDestroy() {}
        }
      `;
      assertFailures(ruleName, source, [
        {
          endPosition: {
            character: 18,
            line: 2,
          },
          message: getFailureMessage({
            interfaceName: AngularLifecycleInterfaces.OnInit,
            methodName: AngularLifecycleMethods.ngOnInit,
          }),
          startPosition: {
            character: 10,
            line: 2,
          },
        },
        {
          endPosition: {
            character: 21,
            line: 4,
          },
          message: getFailureMessage({
            interfaceName: AngularLifecycleInterfaces.OnDestroy,
            methodName: AngularLifecycleMethods.ngOnDestroy,
          }),
          startPosition: {
            character: 10,
            line: 4,
          },
        },
      ]);
    });

    it('should fail if lifecycle methods are declared without implementing their interfaces, using namespace', () => {
      const source = `
        class Test extends Component implements ng.OnInit {
          ngOnInit() {}

          ngOnDestroy() {
          ~~~~~~~~~~~
          }
        }
      `;
      const message = getFailureMessage({
        interfaceName: AngularLifecycleInterfaces.OnDestroy,
        methodName: AngularLifecycleMethods.ngOnDestroy,
      });
      assertAnnotated({
        message,
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed if lifecycle method is declared implementing its interface', () => {
      const source = `
        class Test implements OnInit {
          ngOnInit() {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if lifecycle methods are declared implementing their interfaces', () => {
      const source = `
        class Test extends Component implements OnInit, OnDestroy  {
          ngOnInit() {}

          private ngOnChanges = '';

          ngOnDestroy() {}

          ngOnSmth {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if lifecycle methods are declared implementing their interfaces, using namespaces', () => {
      const source = `
        class Test extends Component implements ng.OnInit, ng.OnDestroy  {
          ngOnInit() {}

          private ngOnChanges = '';

          ngOnDestroy() {}

          ngOnSmth {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if no lifecycle methods are declared', () => {
      const source = `
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
