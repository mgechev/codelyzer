import {assertFailure, assertSuccess} from './testHelper';

describe('no-inject-decorator', () => {
    describe('invalid parameter decorator', () => {
        it(`should fail, when it's used inject decorator`, () => {
            let source = `
            class AppComponent {
                constructor(@Inject(DataService) dataService) {}
            }`;
            assertFailure('no-inject-decorator', source, {
                message: 'In the constructor of class "AppComponent", the parameter "dataService" uses the @Inject decorator, ' +
                'which is considered a bad practice. Please, declare the injected class with the @Injectable decorator',
                startPosition: {
                    line: 2,
                    character: 28
                },
                endPosition: {
                    line: 2,
                    character: 60
                }
            });
        });
    });
    describe('valid class constructor declaration', () => {
        it('should succeed, when is not used inject decorator', () => {
            let source = `
            class AppComponent {
                constructor(){}
            }`;
            assertSuccess('no-inject-decorator', source);
        });
    });
});
