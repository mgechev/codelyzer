"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('use-life-cycle-interface', function () {
    describe('invalid declaration of life hook', function () {
        it("should fail, when a life cycle hook is used without implementing it's interface", function () {
            var source = "\n            class App {\n                ngOnInit(){\n                ~~~~~~~~\n                }\n            }";
            testHelper_1.assertAnnotated({
                ruleName: 'use-life-cycle-interface',
                message: 'Implement lifecycle hook interface OnInit for method ngOnInit in class App ($$09-01$$)',
                source: source
            });
        });
        it("should fail, when life cycle hooks are used without implementing their interfaces", function () {
            var source = "\n            class App {\n                ngOnInit(){\n                }\n                ngOnDestroy(){\n                }\n            }";
            testHelper_1.assertFailures('use-life-cycle-interface', source, [{
                    message: 'Implement lifecycle hook interface OnInit for method ngOnInit in class App ($$09-01$$)',
                    startPosition: {
                        line: 2,
                        character: 16
                    },
                    endPosition: {
                        line: 2,
                        character: 24
                    }
                }, {
                    message: 'Implement lifecycle hook interface OnDestroy for method ngOnDestroy in class App ($$09-01$$)',
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
        it("should fail, when some of the life cycle hooks are used without implementing their interfaces", function () {
            var source = "\n            class App extends Component implements OnInit{\n                ngOnInit(){\n                }\n                ngOnDestroy(){\n                ~~~~~~~~~~~\n                }\n            }";
            testHelper_1.assertAnnotated({
                ruleName: 'use-life-cycle-interface',
                message: 'Implement lifecycle hook interface OnDestroy for method ngOnDestroy in class App ($$09-01$$)',
                source: source
            });
        });
    });
    describe('invalid declaration of life hooks, using ng.hookName', function () {
        it("should fail, when life cycle hooks are used without implementing all interfaces, using ng.hookName", function () {
            var source = "\n            class App extends Component implements ng.OnInit{\n                ngOnInit(){\n                }\n                ngOnDestroy(){\n                ~~~~~~~~~~~\n                }\n            }";
            testHelper_1.assertAnnotated({
                ruleName: 'use-life-cycle-interface',
                message: 'Implement lifecycle hook interface OnDestroy for method ngOnDestroy in class App ($$09-01$$)',
                source: source
            });
        });
    });
    describe('valid declaration of life hook', function () {
        it("should succeed, when life cycle hook is used with it's corresponding interface", function () {
            var source = "\n            class App implements OnInit {\n                ngOnInit(){\n                }\n            }";
            testHelper_1.assertSuccess('use-life-cycle-interface', source);
        });
        it("should succeed, when life cycle hooks are used with their corresponding interfaces", function () {
            var source = "\n            class App extends Component implements OnInit,OnDestroy  {\n                ngOnInit(){\n                }\n\n                private ngOnChanges:string=\"\";\n\n                ngOnDestroy(){\n                }\n\n                ngOnSmth{\n                }\n            }";
            testHelper_1.assertSuccess('use-life-cycle-interface', source);
        });
    });
    describe('valid declaration of life hooks, using ng.hookName', function () {
        it("should succeed, when life cycle hook is used with it's interface", function () {
            var source = "\n            class App implements ng.OnInit {\n                ngOnInit(){\n                }\n            }";
            testHelper_1.assertSuccess('use-life-cycle-interface', source);
        });
        it('should succeed when life cycle hook is implemented by using any prefix', function () {
            var source = "\n            class App implements bar.OnInit {\n                ngOnInit(){\n                }\n            }";
            testHelper_1.assertSuccess('use-life-cycle-interface', source);
        });
        it('should succeed when life cycle hook is implemented by using nested interfaces', function () {
            var source = "\n            class App implements bar.foo.baz.OnInit {\n                ngOnInit(){\n                }\n            }";
            testHelper_1.assertSuccess('use-life-cycle-interface', source);
        });
        it("should succeed, when life cycle hooks are used with their corresponding interfaces", function () {
            var source = "\n            class App extends Component implements ng.OnInit, ng.OnDestroy  {\n                ngOnInit(){\n                }\n\n                private ngOnChanges:string=\"\";\n\n                ngOnDestroy(){\n                }\n\n                ngOnSmth{\n                }\n            }";
            testHelper_1.assertSuccess('use-life-cycle-interface', source);
        });
    });
    describe('valid use of class without interfaces and life cycle hooks', function () {
        it("should succeed when life cycle hooks are not used", function () {
            var source = "\n            class App{}";
            testHelper_1.assertSuccess('use-life-cycle-interface', source);
        });
    });
    describe('valid declaration of class using Iterator', function () {
        it("should succeed, when is used iterator", function () {
            var source = "\n            export class Heroes implements Iterable<Hero> {\n              [Symbol.iterator]() {\n                return this.currentHeroes.values();\n              }\n            }";
            testHelper_1.assertSuccess('use-life-cycle-interface', source);
        });
    });
});
