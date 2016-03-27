import {assertFailure, assertSuccess} from './testHelper';

describe('call-forward-ref', () => {
    describe('invalid function call', ()=> {
        it('should fail when we are calling forwardRef in constructor', () => {
            let source = `
            class Test {
                constructor(@Inject(forwardRef(()=>NameService)) nameService) {}
            }
            class NameService {}`;
            assertFailure('call-forward-ref', source, {
                message: 'In the class "Test" you are calling forwardRef, which is considered a bad practice ' +
                'and indicates either a cyclic dependency or inconsistency in the services declaration',
                startPosition: {
                    line: 2,
                    character: 36
                },
                endPosition: {
                    line: 2,
                    character: 63
                }
            });
        });
        it('should fail when we are calling forwardRef in Component directives array', () => {
            let source = `
            @Component({
                directives: [forwardRef(()=>NameService)]
            })
            class Test {}
            class NameService {}`;
            assertFailure('call-forward-ref', source, {
                message: 'In the class "Test" you are calling forwardRef, which is considered a bad practice ' +
                'and indicates either a cyclic dependency or inconsistency in the services declaration',
                startPosition: {
                    line: 2,
                    character: 29
                },
                endPosition: {
                    line: 2,
                    character: 56
                }
            });
        });
    });
    describe('valid function call', ()=> {
        it('should succeed, when we are not calling forwardRef', () => {
            let source = `
                class Test {
                    constructor() {
                        this.test();
                    }
                    test(){
                    }
                }`;
            assertSuccess('call-forward-ref', source);
        });
    })
});
