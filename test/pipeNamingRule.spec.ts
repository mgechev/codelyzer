import { assertSuccess, assertAnnotated } from './testHelper';

describe('pipe-naming', () => {
  describe('invalid pipe name', () => {
    it('should fail when Pipe is named camelCase without prefix ng', () => {
      let source = `
        @Pipe({
          name: 'foo-bar'
          ~~~~~~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'pipe-naming',
        message:
          'The name of the Pipe decorator of class Test should be named ' + 'camelCase with prefix ng, however its value is "foo-bar"',
        source,
        options: ['camelCase', 'ng']
      });
    });

    it('should fail when Pipe is named camelCase without prefix applying multiple prefixes', () => {
      let source = `
        @Pipe({
          name: 'foo-bar'
          ~~~~~~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'pipe-naming',
        message:
          'The name of the Pipe decorator of class Test should be named camelCase' +
          ' with prefix ng,mg,sg, however its value is "foo-bar"',
        source,
        options: ['camelCase', 'ng', 'mg', 'sg']
      });
    });

    it('should fail when Pipe is named camelCase and has longer prefix', () => {
      let source = `
        @Pipe({
          name: 'fooBar'
          ~~~~~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'pipe-naming',
        message:
          'The name of the Pipe decorator of class Test should be named camelCase ' + 'with prefix fo,mg,sg, however its value is "fooBar"',
        source,
        options: ['camelCase', 'fo', 'mg', 'sg']
      });
    });

    it('should fail when Pipe is not named camelCase without prefix', () => {
      let source = `
        @Pipe({
          name: 'foo-bar'
          ~~~~~~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'pipe-naming',
        message: 'The name of the Pipe decorator of class Test should be named camelCase,' + ' however its value is "foo-bar"',
        source,
        options: 'camelCase'
      });
    });
  });

  describe('empty pipe', () => {
    it('should not fail when @Pipe not invoked', () => {
      let source = `
        @Pipe
        class Test {}
      `;
      assertSuccess('pipe-naming', source, ['camelCase', 'ng']);
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
      assertSuccess('pipe-naming', source, ['camelCase', 'ng']);
    });
  });

  describe('valid pipe name', () => {
    it('should succeed when set valid name with prefix ng in @Pipe', () => {
      let source = `
        @Pipe({
          name: 'ngBarFoo'
        })
        class Test {}
      `;
      assertSuccess('pipe-naming', source, ['camelCase', 'ng']);
    });

    it('should succeed when set valid name applying multiple prefixes in @Pipe', () => {
      let source = `
        @Pipe({
          name: 'ngBarFoo'
        })
        class Test {}
      `;
      assertSuccess('pipe-naming', source, ['camelCase', 'ng', 'sg', 'mg']);
    });

    it('should succeed when set valid name in @Pipe', () => {
      let source = `
        @Pipe({
          name: 'barFoo'
        })
        class Test {}
      `;
      assertSuccess('pipe-naming', source, ['camelCase']);
    });

    it('should succeed when the class is not a Pipe', () => {
      let source = `
        class Test {}
      `;
      assertSuccess('pipe-naming', source, ['camelCase']);
    });
    it('should do nothing if the name of the pipe is not a literal', () => {
      let source = `
        const pipeName = 'foo-bar';
        @Pipe({
          name: pipeName
        })
        class Test {}
      `;
      assertSuccess('pipe-naming', source, ['camelCase']);
    });
  });
});
