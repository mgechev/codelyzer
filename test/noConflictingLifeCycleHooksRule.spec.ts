import { assertFailures, assertSuccess, IExpectedFailure } from './testHelper';

const ruleName = 'no-conflicting-life-cycle-hooks';
const fails: IExpectedFailure[] = [
  {
    endPosition: {
      line: 4,
      character: 9
    },
    message: 'Implement DoCheck and OnChanges hooks in class Test is not recommended',
    startPosition: {
      line: 1,
      character: 8
    }
  }
];

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when implements both DoCheck and OnChanges hooks', () => {
      const source = `
        class Test implements DoCheck, OnChanges {
          test() {}
          test1() {}
        }
      `;
      assertFailures(ruleName, source, fails);
    });

    it('should fail when implements both DoCheck and OnChanges hooks/methods', () => {
      const source = `
        class Test implements DoCheck, OnChanges {
          ngDoCheck() {}
          ngOnChanges() {}
        }
      `;
      assertFailures(ruleName, source, fails.concat(fails));
    });

    it('should fail have both ngDoCheck and ngOnChanges methods exist', () => {
      const source = `
        class Test {
          ngDoCheck() {}
          ngOnChanges() {}
        }
      `;
      assertFailures(ruleName, source, fails);
    });
  });

  describe('success', () => {
    it('should pass when contain ngDoCheck, but not ngOnChanges method', () => {
      const source = `
        class Test {
          ngDoCheck() {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass when implements DoCheck, but not OnChanges hook', () => {
      const source = `
        class Test implements DoCheck {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass when implementing and contain DoCheck hook/method, but not OnChanges hook/method', () => {
      const source = `
        class Test implements DoCheck {
          ngDoCheck() {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass when contain ngOnChanges, but not ngDoCheck method', () => {
      const source = `
        class Test {
          ngOnChanges() {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass when implements OnChanges, but not DoCheck hook', () => {
      const source = `
        class Test implements OnChanges {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should pass when implementing and contain OnChanges hook/method, but not DoCheck hook/method', () => {
      const source = `
        class Test implements OnChanges {
          ngOnChanges() {}
        }
      `;
      assertSuccess(ruleName, source);
    });
  });
});
