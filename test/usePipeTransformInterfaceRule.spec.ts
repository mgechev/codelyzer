import { assertSuccess, assertAnnotated } from './testHelper';

describe('use-pipe-transform-interface', () => {
  describe('invalid declaration of pipe', () => {
    it('should fail, when a Pipe is declared without implementing the PipeTransform interface', () => {
      let source = `
      @Pipe({name: 'fetch'})
      ~~~~~~~~~~~~~~~~~~~~~~
      export class NewPipe {
        transform(url:string):any {
        }
      }
      ~`;
      assertAnnotated({
        ruleName: 'use-pipe-transform-interface',
        message: 'The NewPipe class has the Pipe decorator, so it should implement the PipeTransform interface',
        source
      });
    });
  });

  describe('valid use of Pipe with the implementation of the PipeTransform interface', () => {
    it('should succeed when Pipe is declared properly', () => {
      let source = `
        @Pipe({name: 'fetch'})
        export class NewPipe  implements PipeTransform{
          transform(url:string):any {
          }
        }`;
      assertSuccess('use-pipe-transform-interface', source);
    });

    it('should succeed when Pipe is declared properly', () => {
      let source = `
        @Pipe({name: 'fetch'})
        export class NewPipe  implements ng.PipeTransform {
          transform(url:string):any {
          }
        }`;
      assertSuccess('use-pipe-transform-interface', source);
    });
  });

  describe('valid use of empty class', () => {
    it('should succeed, when Pipe is not used', () => {
      let source = 'class App{}';
      assertSuccess('use-pipe-transform-interface', source);
    });
  });

  describe('valid use with @Injectable', () => {
    it('should succeed, when Pipe is not used', () => {
      let source = `@Injectable
        class App{}`;
      assertSuccess('use-pipe-transform-interface', source);
    });
  });
});
