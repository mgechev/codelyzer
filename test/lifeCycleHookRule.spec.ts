import {assertFailure, assertSuccess} from './testHelper';

describe('life-cycle-hook', () => {
    describe('invalid declaration of life hook', () => {
        it(`should fail, when a life cycle hook is used without implementing it's interface`, () => {
            let source = `
            class App {
                ngOnInit(){
                }
            }`;
            assertFailure('life-cycle-hook', source, {
                message: 'In class App the method ngOnInit is a life cycle hook and should implement the OnInit interface',
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
            assertFailure('life-cycle-hook', source, {
                message: 'In class App the methods - ngOnInit, ngOnDestroy are life cycle hooks and ' +
                'should implement the interfaces: OnInit, OnDestroy',
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
            assertFailure('life-cycle-hook', source, {
                message: 'In class App the method ngOnDestroy is a life cycle hook and should implement the OnDestroy interface',
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
            assertSuccess('life-cycle-hook', source);
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
            assertSuccess('life-cycle-hook', source);
        });
    });
    describe('valid use of class without interfaces and life cycle hooks', () => {
        it(`should succeed when life cycle hooks are not used`, () => {
            let source = `
            class App{}`;
            assertSuccess('life-cycle-hook', source);
        });
    });
});
