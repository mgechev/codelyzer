import { Rule } from '../src/relativeUrlPrefixRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('styleUrls', () => {
    describe('success', () => {
      it('should succeed when a relative URL is prefixed by ./', () => {
        const source = `
                    @Component({
                        styleUrls: ['./foobar.css']
                    })
                    class Test {}
                    `;
        assertSuccess(ruleName, source);
      });

      it('should succeed when all relative URLs is prefixed by ./', () => {
        const source = `
                    @Component({
                        styleUrls: ['./foo.css', './bar.css', './whatyouwant.css']
                    })
                    class Test {}
                    `;
        assertSuccess(ruleName, source);
      });
    });

    describe('failure', () => {
      it("should fail when a relative URL isn't prefixed by ./", () => {
        const source = `
                    @Component({
                        styleUrls: ['foobar.css']
                                    ~~~~~~~~~~~~
                    })
                    class Test {}
                    `;
        assertAnnotated({
          ruleName,
          message: Rule.FAILURE_STRING,
          source,
        });
      });

      it("should fail when a relative URL isn't prefixed by ./", () => {
        const source = `
                    @Component({
                        styleUrls: ['./../foobar.css']
                                    ~~~~~~~~~~~~~~~~~
                    })
                    class Test {}
                    `;
        assertAnnotated({
          ruleName,
          message: Rule.FAILURE_STRING,
          source,
        });
      });

      it("should fail when one relative URLs isn't prefixed by ./", () => {
        const source = `
                    @Component({
                        styleUrls: ['./foo.css', 'bar.css', './whatyouwant.css']
                                                 ~~~~~~~~~ 
                    })
                    class Test {}
                    `;
        assertAnnotated({
          ruleName,
          message: Rule.FAILURE_STRING,
          source,
        });
      });
    });
  });

  describe('templateUrl', () => {
    describe('success', () => {
      it('should succeed when a relative URL is prefixed by ./', () => {
        const source = `
                    @Component({
                        templateUrl: './foobar.html'
                    })
                    class Test {}
                    `;
        assertSuccess(ruleName, source);
      });
    });

    describe('failure', () => {
      it("should succeed when a relative URL isn't prefixed by ./", () => {
        const source = `
                    @Component({
                        templateUrl: 'foobar.html'
                                     ~~~~~~~~~~~~~
                    })
                    class Test {}
                    `;
        assertAnnotated({
          ruleName,
          message: Rule.FAILURE_STRING,
          source,
        });
      });

      it('should fail when a relative URL is prefixed by ../', () => {
        const source = `
                    @Component({
                        templateUrl: '../foobar.html'
                                     ~~~~~~~~~~~~~~~~
                   })
                    class Test {}
                    `;
        assertAnnotated({
          ruleName,
          message: Rule.FAILURE_STRING,
          source,
        });
      });

      it('should fail when a relative URL is prefixed by ../', () => {
        const source = `
                    @Component({
                        templateUrl: '.././foobar.html'
                                     ~~~~~~~~~~~~~~~~~~
                   })
                    class Test {}
                    `;
        assertAnnotated({
          ruleName,
          message: Rule.FAILURE_STRING,
          source,
        });
      });
    });
  });
});
