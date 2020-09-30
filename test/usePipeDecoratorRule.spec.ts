import { Rule } from '../src/usePipeDecoratorRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if a class implements PipeTransform interface without using @Pipe decorator', () => {
      const source = `
        @Test()
        ~~~~~~~
        export class Test implements PipeTransform {}
                                                    ~
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail if a class implements PipeTransform interface (using namespace) without using @Pipe decorator', () => {
      const source = `
        @Test()
        ~~~~~~~
        export class Test implements ng.PipeTransform {}
                                                       ~
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail if a class implements PipeTransform interface without using @Pipe or any decorator', () => {
      const source = `
        export class TestPipe implements PipeTransform {
        ~~~~~~~~~~~~~~~~~~~~~
          transform(value: string) {}
        }
        ~
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail if a class implements PipeTransform interface without using @Pipe decorator, but multiple others', () => {
      const source = `
        @Test()
        ~~~~~~~
        @Test2()
        export class Test implements PipeTransform {
        }
        ~
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed if a class implements PipeTransform interface with using @Pipe decorator', () => {
      const source = `
        @Pipe({ name: 'test' })
        export class TestPipe implements PipeTransform {
          transform(value: string) {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if a class implements PipeTransform interface (using namespace) with using @Pipe decorator', () => {
      const source = `
        @Pipe({ name: 'test' })
        export class TestPipe implements ng.PipeTransform {
          transform(value: string) {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if a class does not implement PipeTransform or any interface', () => {
      const source = `
        export class TestPipe {
          transform(value: string) {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if a class does not implement PipeTransform interface, but multiple others', () => {
      const source = `
        export class TestPipe implements NgTransform, OnInit {
          transform(value: string) {}
        }
      `;
      assertSuccess(ruleName, source);
    });
  });
});
