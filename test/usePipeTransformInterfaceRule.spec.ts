import { Rule } from '../src/usePipeTransformInterfaceRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if a class is decorated with @Pipe and has no interface implemented', () => {
      const source = `
        @Pipe({ name: 'test' })
        ~~~~~~~~~~~~~~~~~~~~~~
        export class TestPipe {
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

    it('should fail if a class is decorated with @Pipe and does not implement the PipeTransform interface', () => {
      const source = `
        @Pipe({ name: 'test' })
        ~~~~~~~~~~~~~~~~~~~~~~
        export class TestPipe implements AnInterface {
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

    it('should fail if a class is decorated with @Pipe and other decorator and does not implement the PipeTransform interface', () => {
      const source = `
        @OtherDecorator()
        ~~~~~~~~~~~~~~~~~
        @Pipe({ name: 'test' })
        export class TestPipe implements AnInterface {
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
  });

  describe('success', () => {
    it('should succeed if a class is decorated with @Pipe and implements the PipeTransform interface', () => {
      const source = `
        @Pipe({ name: 'test' })
        export class TestPipe implements PipeTransform {
          transform(value: string) {}
        }
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if a class is decorated with @Pipe and other decorator and implements the PipeTransform interface', () => {
      const source = `
        @OtherDecorator()
        @Pipe({ name: 'test' })
        export class TestPipe implements PipeTransform {
          transform(value: string) {}
        }
        ~
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if a class is decorated with @Pipe and implements the PipeTransform interface using namespace', () => {
      const source = `
        @Pipe({ name: 'test' })
        export class TestPipe implements ng.PipeTransform {
          transform(value: string) {}
        }
      `;
      assertSuccess(ruleName, source);
    });
  });
});
