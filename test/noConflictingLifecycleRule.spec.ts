import { getFailureMessage, Rule } from '../src/noConflictingLifecycleRule';
import { assertFailures, assertSuccess, ExpectedFailure } from './testHelper';

const {
  FAILURE_STRING_INTERFACE_HOOK,
  FAILURE_STRING_METHOD_HOOK,
  metadata: { ruleName },
} = Rule;
const failures: ExpectedFailure = {
  endPosition: {
    character: 9,
    line: 4,
  },
  message: '',
  startPosition: {
    character: 8,
    line: 1,
  },
};
const interfaceFailures: ExpectedFailure[] = [
  {
    ...failures,
    message: getFailureMessage({
      message: FAILURE_STRING_INTERFACE_HOOK,
    }),
  },
];
const methodFailures: ExpectedFailure[] = [
  {
    ...failures,
    message: getFailureMessage({
      message: FAILURE_STRING_METHOD_HOOK,
    }),
  },
];

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if implement DoCheck and OnChanges', () => {
      const source = `
        class Test implements DoCheck, OnChanges {
          test() {}
          test1() {}
        }
      `;
      assertFailures(ruleName, source, interfaceFailures);
    });

    it('should fail if implement DoCheck and OnChanges and contain the ngDoCheck and ngOnChanges methods', () => {
      const source = `
        class Test implements DoCheck, OnChanges {
          ngDoCheck() {}
          ngOnChanges() {}
        }
      `;
      assertFailures(ruleName, source, interfaceFailures.concat(methodFailures));
    });

    it('should fail if the ngDoCheck and ngOnChanges methods exist', () => {
      const source = `
        class Test {
          ngDoCheck() {}
          ngOnChanges() {}
        }
      `;
      assertFailures(ruleName, source, methodFailures);
    });
  });

  describe('success', () => {
    it('should pass if implements DoCheck, but not OnChanges', () => {
      const source = `
        class Test implements DoCheck {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass if contains ngDoCheck method, but not ngOnChanges', () => {
      const source = `
        class Test {
          ngDoCheck() {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass if implements DoCheck and contains ngDoCheck method, but does not implement OnChanges and does not contain ngOnChanges method', () => {
      const source = `
        class Test implements DoCheck {
          ngDoCheck() {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass if implements OnChanges, but not DoCheck', () => {
      const source = `
        class Test implements OnChanges {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass if contains ngOnChanges method, but not ngDoCheck', () => {
      const source = `
        class Test {
          ngOnChanges() {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass if implements OnChanges and contains ngOnChanges method, but does not implement DoCheck and does not contain ngDoCheck method', () => {
      const source = `
        class Test implements OnChanges {
          ngOnChanges() {}
        }
      `;
      assertSuccess(ruleName, source);
    });
  });
});
