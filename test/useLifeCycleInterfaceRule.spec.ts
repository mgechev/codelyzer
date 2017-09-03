import { assertSuccess, assertFailures, assertAnnotated } from './testHelper';

describe('use-life-cycle-interface', () => {
    describe('invalid declaration of life hook', () => {
        it(`should fail, when a life cycle hook is used without implementing it's interface`, () => {
            let source = `
            class App {
                ngOnInit(){
                ~~~~~~~~
                }
            }`;
            assertAnnotated({
                ruleName: 'use-life-cycle-interface',
                message: 'Implement lifecycle hook interface OnInit for method ngOnInit in class App' +
                  ' (https://angular.io/styleguide#style-09-01)',
                source
            });
        });
        it(`should fail, when life cycle hooks are used without implementing their interfaces`, () => {
            let source = `
            class App {
                ngOnInit(){
                }
                ngOnDestroy(){
                }
            }`;
            assertFailures('use-life-cycle-interface', source, [{
                message: 'Implement lifecycle hook interface OnInit for method ngOnInit in class App' +
                  ' (https://angular.io/styleguide#style-09-01)',
                startPosition: {
                    line: 2,
                    character: 16
                },
                endPosition: {
                    line: 2,
                    character: 24
                }
            }, {
                message: 'Implement lifecycle hook interface OnDestroy for method ngOnDestroy in class App' +
                  ' (https://angular.io/styleguide#style-09-01)',
                startPosition: {
                    line: 4,
                    character: 16
                },
                endPosition: {
                    line: 4,
                    character: 27
                }
            }
            ]);
        });
        it(`should fail, when some of the life cycle hooks are used without implementing their interfaces`, () => {
            let source = `
            class App extends Component implements OnInit{
                ngOnInit(){
                }
                ngOnDestroy(){
                ~~~~~~~~~~~
                }
            }`;
            assertAnnotated({
                ruleName: 'use-life-cycle-interface',
                message: 'Implement lifecycle hook interface OnDestroy for method ngOnDestroy in class App' +
                  ' (https://angular.io/styleguide#style-09-01)',
                source
            });
        });
    });
    describe('invalid declaration of life hooks, using ng.hookName', () => {
        it(`should fail, when life cycle hooks are used without implementing all interfaces, using ng.hookName`, () => {
            let source = `
            class App extends Component implements ng.OnInit{
                ngOnInit(){
                }
                ngOnDestroy(){
                ~~~~~~~~~~~
                }
            }`;
            assertAnnotated({
                ruleName: 'use-life-cycle-interface',
                message: 'Implement lifecycle hook interface OnDestroy for method ngOnDestroy in class App' +
                  ' (https://angular.io/styleguide#style-09-01)',
                source
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

    describe('valid declaration of life hooks, using ng.hookName', () => {

        it(`should succeed, when life cycle hook is used with it's interface`, () => {
            let source = `
            class App implements ng.OnInit {
                ngOnInit(){
                }
            }`;
            assertSuccess('use-life-cycle-interface', source);
        });

        it('should succeed when life cycle hook is implemented by using any prefix', () => {
            let source = `
            class App implements bar.OnInit {
                ngOnInit(){
                }
            }`;
            assertSuccess('use-life-cycle-interface', source);
        });

        it('should succeed when life cycle hook is implemented by using nested interfaces', () => {
            let source = `
            class App implements bar.foo.baz.OnInit {
                ngOnInit(){
                }
            }`;
            assertSuccess('use-life-cycle-interface', source);
        });

        it(`should succeed, when life cycle hooks are used with their corresponding interfaces`, () => {
            let source = `
            class App extends Component implements ng.OnInit, ng.OnDestroy  {
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
