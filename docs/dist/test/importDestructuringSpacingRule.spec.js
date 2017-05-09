"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testHelper_1 = require("./testHelper");
describe('import-destructuring-spacing', function () {
    describe('invalid import spacing', function () {
        it('should fail when the imports have no spaces', function () {
            var source = "\n                    import {Foo} from './foo'\n                           ~~~~~\n      ";
            testHelper_1.assertAnnotated({
                ruleName: 'import-destructuring-spacing',
                message: 'You need to leave whitespaces inside of the import statement\'s curly braces',
                source: source
            });
        });
        it('should fail with multiple items to import', function () {
            var source = "\n      import {Foo,Bar} from './foo'\n             ~~~~~~~~~\n      ";
            testHelper_1.assertAnnotated({
                ruleName: 'import-destructuring-spacing',
                message: 'You need to leave whitespaces inside of the import statement\'s curly braces',
                source: source
            });
        });
        it('should fail with spaces between items', function () {
            var source = "\n        import {Foo,  Bar} from './foo'\n               ~~~~~~~~~~~\n        ";
            testHelper_1.assertAnnotated({
                ruleName: 'import-destructuring-spacing',
                message: 'You need to leave whitespaces inside of the import statement\'s curly braces',
                source: source
            });
        });
        it('should fail with only one whitespace in the left', function () {
            var source = "\n      import { Foo} from './foo';\n             ~~~~~~\n      ";
            testHelper_1.assertAnnotated({
                ruleName: 'import-destructuring-spacing',
                message: 'You need to leave whitespaces inside of the import statement\'s curly braces',
                source: source
            });
        });
        it('should fail with only one whitespace in the right', function () {
            var source = "\n      import {Foo } from './foo';\n             ~~~~~~\n       ";
            testHelper_1.assertAnnotated({
                ruleName: 'import-destructuring-spacing',
                message: 'You need to leave whitespaces inside of the import statement\'s curly braces',
                source: source
            });
        });
    });
    describe('valid import spacing', function () {
        it('should succeed with valid spacing', function () {
            var source = "import { Foo } from './foo';";
            testHelper_1.assertSuccess('import-destructuring-spacing', source);
        });
        it('should work with alias imports', function () {
            var source = "import * as Foo from './foo';";
            testHelper_1.assertSuccess('import-destructuring-spacing', source);
        });
    });
});
