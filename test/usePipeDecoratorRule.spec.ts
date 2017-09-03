import { assertSuccess, assertAnnotated } from './testHelper';

describe('use-pipe-decorator', () => {
  describe('invalid use of pipe transform interface', () => {
    it(`should fail, when PipeTransform interface is used, without @Pipe or any decorators`, () => {
      let source = `
      export class NewPipe implements PipeTransform {
      ~~~~~~~~~~~~~~~~~~~~
        transform(url:string):any {
        }
      }
      ~`;
      assertAnnotated({
        ruleName: 'use-pipe-decorator',
        message: 'The NewPipe class implements the PipeTransform interface, so it should use the @Pipe decorator',
        source
      });
    });
    it(`should fail, when PipeTransform interface is used, without @Pipe decorator, but using other`, () => {
      let source = `
        @Test()
        ~~~~~~~
        export class Test implements PipeTransform {
        }
        ~`;
      assertAnnotated({
        ruleName: 'use-pipe-decorator',
        message: 'The Test class implements the PipeTransform interface, so it should use the @Pipe decorator',
        source
      });
    });
    it(`should fail, when PipeTransform interface is used, without @Pipe decorator, but using multiple others`, () => {
      let source = `
        @Test()
        ~~~~~~~
        @Test2()
        export class Test  implements PipeTransform {
        }
        ~`;
      assertAnnotated({
        ruleName: 'use-pipe-decorator',
        message: 'The Test class implements the PipeTransform interface, so it should use the @Pipe decorator',
        source
      });
    });
  });
  describe('valid use of pipe transform interface', () => {
    it(`should succeed, when PipeTransform interface is used, with Pipe decorator`, () => {
      let source = `
      @Pipe({name: 'fetch'})
      export class NewPipe  implements PipeTransform{
          transform(url:string):any {
          }
        }`;
      assertSuccess('use-pipe-decorator', source);
    });
  });
  describe('valid use of empty class', () => {
    it(`should succeed, when PipeTransform interface is not used`, () => {
      let source = `class App{}`;
      assertSuccess('use-pipe-decorator', source);
    });
  });
});
