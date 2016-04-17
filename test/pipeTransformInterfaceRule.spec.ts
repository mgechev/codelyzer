import {assertFailure, assertSuccess} from './testHelper';

describe('pipe-transform-interface', () => {
    describe('invalid declaration of pipe', () => {
        it(`should fail, when a Pipe is declared without implementing the PipeTransform interface`, () => {
            let source = `
                        @Pipe({name: 'fetch'})
                        export class NewPipe{
                          transform(url:string):any {
                          }
                        }`;
            assertFailure('pipe-transform-interface', source, {
                message: 'The NewPipe class has the Pipe decorator, so it should implement the PipeTransform interface',
                startPosition: {
                    line: 1,
                    character: 24
                },
                endPosition: {
                    line: 5,
                    character: 25
                }
            });
        });
    });
    describe('valid use of Pipe with the implementation of the PipeTransform interface', () => {
        it(`should succeed when Pipe is declared properly`, () => {
            let source = `
                    @Pipe({name: 'fetch'})
                    export class NewPipe  implements PipeTransform{
                      transform(url:string):any {
                      }
                    }`;
            assertSuccess('pipe-transform-interface', source);
        });
    });
    describe('valid use of empty class', () => {
        it(`should succeed, when Pipe is not used`, () => {
            let source = `class App{}`;
            assertSuccess('pipe-transform-interface', source);
        });
    });
});
