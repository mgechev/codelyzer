"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var chai = require("chai");
var utils_1 = require("../../src/util/utils");
var sourceMappingVisitor_1 = require("../../src/angular/sourceMappingVisitor");
var node_sass_1 = require("node-sass");
var getAst = function (code, file) {
    if (file === void 0) { file = 'file.ts'; }
    return ts.createSourceFile(file, code, ts.ScriptTarget.ES2015, true);
};
var fixture1 = "@Component({\n  styles: [\n    `\n    .foo {\n      .bar {\n        color: red;\n      }\n    }\n    `\n  ]\n})\nexport class Foo {}\n";
describe('SourceMappingVisitor', function () {
    it('should map to correct position', function () {
        var ast = getAst(fixture1);
        var classDeclaration = ast.statements.pop();
        var styles = utils_1.getDecoratorPropertyInitializer(classDeclaration.decorators.pop(), 'styles');
        var styleNode = styles.elements[0];
        var scss = styleNode.text;
        var result = node_sass_1.renderSync({ outFile: '/tmp/bar', data: scss, sourceMap: true });
        var visitor = new sourceMappingVisitor_1.SourceMappingVisitor(ast, {
            disabledIntervals: null, ruleName: 'foo', ruleArguments: [], ruleSeverity: 'warning'
        }, {
            code: result.css.toString(),
            map: JSON.parse(result.map.toString()),
            source: scss
        }, styleNode.getStart() + 1);
        var failure = visitor.createFailure(0, 3, 'bar');
        chai.expect(failure.getStartPosition().getPosition()).eq(34);
        chai.expect(failure.getEndPosition().getPosition()).eq(38);
    });
});
