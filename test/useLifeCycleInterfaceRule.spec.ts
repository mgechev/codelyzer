import { sprintf } from 'sprintf-js';
import { Rule } from '../src/useLifeCycleInterfaceRule';
import { assertAnnotated, assertFailures, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName }
} = Rule;
const className = 'Test';

const getErrorMessage = (interfaceName: string, methodName): string => {
  return sprintf(FAILURE_STRING, interfaceName, methodName, className);
};

describe(ruleName, () => {
  describe('invalid declaration of life hook', () => {
    it("should fail, when a life cycle hook is used without implementing it's interface", () => {
      let source = `
        class ${className} {
          ngOnInit() {
          ~~~~~~~~
          }
        }
      `;
      assertAnnotated({
        message: getErrorMessage('OnInit', 'ngOnInit'),
        ruleName,
        source
      });
    });

    it('should fail, when life cycle hooks are used without implementing their interfaces', () => {
      let source = `
        class ${className} {
          ngOnInit() {
          }
          ngOnDestroy() {
          }
        }
      `;
      assertFailures(ruleName, source, [
        {
          endPosition: {
            character: 18,
            line: 2
          },
          message: getErrorMessage('OnInit', 'ngOnInit'),
          startPosition: {
            character: 10,
            line: 2
          }
        },
        {
          endPosition: {
            character: 21,
            line: 4
          },
          message: getErrorMessage('OnDestroy', 'ngOnDestroy'),
          startPosition: {
            character: 10,
            line: 4
          }
        }
      ]);
    });

    it('should fail, when some of the life cycle hooks are used without implementing their interfaces', () => {
      let source = `
        class ${className} extends Component implements OnInit {
          ngOnInit() {
          }
          ngOnDestroy() {
          ~~~~~~~~~~~
          }
        }
      `;
      assertAnnotated({
        ruleName,
        message: getErrorMessage('OnDestroy', 'ngOnDestroy'),
        source
      });
    });
  });

  describe('invalid declaration of life hooks, using ng.hookName', () => {
    it('should fail, when life cycle hooks are used without implementing all interfaces, using ng.hookName', () => {
      let source = `
        class ${className} extends Component implements ng.OnInit {
          ngOnInit() {
          }
          ngOnDestroy() {
          ~~~~~~~~~~~
          }
        }
      `;
      assertAnnotated({
        ruleName,
        message: getErrorMessage('OnDestroy', 'ngOnDestroy'),
        source
      });
    });
  });

  describe('valid declaration of life hook', () => {
    it("should succeed, when life cycle hook is used with it's corresponding interface", () => {
      let source = `
        class ${className} implements OnInit {
          ngOnInit() {
          }
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed, when life cycle hooks are used with their corresponding interfaces', () => {
      let source = `
        class ${className} extends Component implements OnInit, OnDestroy  {
          ngOnInit() {
          }

          private ngOnChanges: string="";

          ngOnDestroy() {
          }

          ngOnSmth {
          }
        }
      `;
      assertSuccess(ruleName, source);
    });
  });

  describe('valid declaration of life hooks, using ng.hookName', () => {
    it("should succeed, when life cycle hook is used with it's interface", () => {
      let source = `
        class ${className} implements ng.OnInit {
          ngOnInit() {
          }
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed when life cycle hook is implemented by using any prefix', () => {
      let source = `
        class ${className} implements bar.OnInit {
          ngOnInit() {
          }
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed when life cycle hook is implemented by using nested interfaces', () => {
      let source = `
        class ${className} implements bar.foo.baz.OnInit {
          ngOnInit() {
          }
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed, when life cycle hooks are used with their corresponding interfaces', () => {
      let source = `
        class ${className} extends Component implements ng.OnInit, ng.OnDestroy  {
          ngOnInit() {
          }

          private ngOnChanges: string="";

          ngOnDestroy() {
          }

          ngOnSmth {
          }
        }
      `;
      assertSuccess(ruleName, source);
    });
  });

  describe('valid use of class without interfaces and life cycle hooks', () => {
    it('should succeed when life cycle hooks are not used', () => {
      let source = `
        class ${className} {}
      `;
      assertSuccess(ruleName, source);
    });
  });

  describe('valid declaration of class using Iterator', () => {
    it('should succeed, when is used iterator', () => {
      let source = `
        export class Heroes implements Iterable<Hero> {
          [Symbol.iterator]() {
            return this.currentHeroes.values();
          }
        }
      `;
      assertSuccess(ruleName, source);
    });
  });
});
