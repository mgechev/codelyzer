import { assertSuccess, assertAnnotated } from './testHelper';

describe('pipe-prefix', () => {
  describe('invalid pipe name', () => {
    it('should fail when Pipe has no prefix ng', () => {
      let source = `
        @Pipe({
          name: 'foo-bar'
          ~~~~~~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'pipe-prefix',
        message: 'The name of the Pipe decorator of class Test should start with prefix ng, however its value is "foo-bar"',
        source,
        options: ['ng'],
      });
    });

    it('should fail when Pipe has no prefix applying multiple prefixes', () => {
      let source = `
        @Pipe({
          name: 'foo-bar'
          ~~~~~~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'pipe-prefix',
        message: 'The name of the Pipe decorator of class Test should start' + ' with prefix ng,mg,sg, however its value is "foo-bar"',
        source,
        options: ['ng', 'mg', 'sg'],
      });
    });
  });

  describe('empty pipe', () => {
    it('should not fail when @Pipe not invoked', () => {
      let source = `
        @Pipe
        class Test {}
      `;
      assertSuccess('pipe-prefix', source, ['ng']);
    });
  });

  describe('pipe with name as variable', () => {
    it('should ignore the rule when the name is a variable', () => {
      const source = `
        export function mockPipe(name: string): any {
          @Pipe({ name })
          class MockPipe implements PipeTransform {
            transform(input: any): any {
              return input;
            }
          }
          return MockPipe;
        }
      `;
      assertSuccess('pipe-prefix', source, ['ng']);
    });
  });

  describe('valid pipe name', () => {
    it('should succeed with prefix ng in @Pipe', () => {
      let source = `
        @Pipe({
          name: 'ngBarFoo'
        })
        class Test {}
      `;
      assertSuccess('pipe-prefix', source, ['ng']);
    });

    it('should succeed with multiple prefixes in @Pipe', () => {
      let source = `
        @Pipe({
          name: 'ngBarFoo'
        })
        class Test {}
      `;
      assertSuccess('pipe-prefix', source, ['ng', 'sg', 'mg']);
    });

    it('should succeed when the class is not a Pipe', () => {
      let source = `
        class Test {}
      `;
      assertSuccess('pipe-prefix', source, ['ng']);
    });

    it('should do nothing if the name of the pipe is not a literal', () => {
      let source = `
        const pipeName = 'fooBar';
        @Pipe({
          name: pipeName
        })
        class Test {}
      `;
      assertSuccess('pipe-prefix', source, ['ng']);
    });
  });
});
