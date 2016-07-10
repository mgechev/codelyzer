import {assertFailure, assertSuccess} from './testHelper';

describe('use-life-cycle-interface', () => {
    describe('invalid declaration of life hook', () => {
        it(`should fail, when a life cycle hook is used without implementing it's interface`, () => {
            let source = `
            class App {
                ngOnInit(){
                }
            }`;
            assertFailure('use-life-cycle-interface', source, {
                message: 'Implement lifecycle hook interfaces ($$09-01$$)',
                startPosition: {
                    line: 1,
                    character: 12
                },
                endPosition: {
                    line: 4,
                    character: 13
                }
            });
        });
    });
    describe('invalid declaration of life hooks', () => {
        it(`should fail, when life cycle hooks are used without implementing their interfaces`, () => {
            let source = `
            class App {
                ngOnInit(){
                }
                ngOnDestroy(){
                }
            }`;
            assertFailure('use-life-cycle-interface', source, {
                message: 'Implement lifecycle hook interfaces ($$09-01$$)',
                startPosition: {
                    line: 1,
                    character: 12
                },
                endPosition: {
                    line: 6,
                    character: 13
                }
            });
        });
    });
    describe('invalid declaration of life hooks', () => {
        it(`should fail, when some of the life cycle hooks are used without implementing their interfaces`, () => {
            let source = `
            class App extends Component implements OnInit{
                ngOnInit(){
                }
                ngOnDestroy(){
                }
            }`;
            assertFailure('use-life-cycle-interface', source, {
                message: 'Implement lifecycle hook interfaces ($$09-01$$)',
                startPosition: {
                    line: 1,
                    character: 12
                },
                endPosition: {
                    line: 6,
                    character: 13
                }
            });
        });
    });
    describe('valid declaration of life hook', () => {
        it(`should succeed, when life cycle hook is used with it's corresponding interface`, () => {
            let source = `
            class App implements OnInit {
                ngOnInit(){
                }
            }`;
            assertSuccess('use-life-cycle-interface', source);
        });
    });
    describe('valid declaration of life hooks', () => {
        it(`should succeed, when life cycle hooks are used with their corresponding interfaces`, () => {
            let source = `
            class App extends Component implements OnInit,OnDestroy  {
                ngOnInit(){
                }

                private ngOnChanges:string="";

                ngOnDestroy(){
                }

                ngOnSmth{
                }
            }`;
            assertSuccess('use-life-cycle-interface', source);
        });
    });
    describe('valid use of class without interfaces and life cycle hooks', () => {
        it(`should succeed when life cycle hooks are not used`, () => {
            let source = `
            class App{}`;
            assertSuccess('use-life-cycle-interface', source);
        });
    });
    describe('valid declaration of class using Iterator', () => {
        it(`should succeed, when is used iterator`, () => {
            let source = `
            export class Heroes implements Iterable<Hero> {
              [Symbol.iterator]() {
                return this.currentHeroes.values();
              }
            }`;
            assertSuccess('use-life-cycle-interface', source);
        });
    });
});
