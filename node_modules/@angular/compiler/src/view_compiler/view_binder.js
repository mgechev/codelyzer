/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { templateVisitAll } from '../template_parser/template_ast';
import { bindOutputs } from './event_binder';
import { bindDirectiveAfterContentLifecycleCallbacks, bindDirectiveAfterViewLifecycleCallbacks, bindDirectiveWrapperLifecycleCallbacks, bindInjectableDestroyLifecycleCallbacks, bindPipeDestroyLifecycleCallbacks } from './lifecycle_binder';
import { bindDirectiveHostProps, bindDirectiveInputs, bindRenderInputs, bindRenderText } from './property_binder';
export function bindView(view, parsedTemplate, schemaRegistry) {
    var visitor = new ViewBinderVisitor(view, schemaRegistry);
    templateVisitAll(visitor, parsedTemplate);
    view.pipes.forEach(function (pipe) { bindPipeDestroyLifecycleCallbacks(pipe.meta, pipe.instance, pipe.view); });
}
var ViewBinderVisitor = (function () {
    function ViewBinderVisitor(view, _schemaRegistry) {
        this.view = view;
        this._schemaRegistry = _schemaRegistry;
        this._nodeIndex = 0;
    }
    ViewBinderVisitor.prototype.visitBoundText = function (ast, parent) {
        var node = this.view.nodes[this._nodeIndex++];
        bindRenderText(ast, node, this.view);
        return null;
    };
    ViewBinderVisitor.prototype.visitText = function (ast, parent) {
        this._nodeIndex++;
        return null;
    };
    ViewBinderVisitor.prototype.visitNgContent = function (ast, parent) { return null; };
    ViewBinderVisitor.prototype.visitElement = function (ast, parent) {
        var _this = this;
        var compileElement = this.view.nodes[this._nodeIndex++];
        var hasEvents = bindOutputs(ast.outputs, ast.directives, compileElement, true);
        bindRenderInputs(ast.inputs, hasEvents, compileElement);
        ast.directives.forEach(function (directiveAst, dirIndex) {
            var directiveWrapperInstance = compileElement.directiveWrapperInstance.get(directiveAst.directive.type.reference);
            bindDirectiveInputs(directiveAst, directiveWrapperInstance, dirIndex, compileElement);
            bindDirectiveHostProps(directiveAst, directiveWrapperInstance, compileElement, ast.name, _this._schemaRegistry);
        });
        templateVisitAll(this, ast.children, compileElement);
        // afterContent and afterView lifecycles need to be called bottom up
        // so that children are notified before parents
        ast.directives.forEach(function (directiveAst) {
            var directiveInstance = compileElement.instances.get(directiveAst.directive.type.reference);
            var directiveWrapperInstance = compileElement.directiveWrapperInstance.get(directiveAst.directive.type.reference);
            bindDirectiveAfterContentLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
            bindDirectiveAfterViewLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
            bindDirectiveWrapperLifecycleCallbacks(directiveAst, directiveWrapperInstance, compileElement);
        });
        ast.providers.forEach(function (providerAst) {
            var providerInstance = compileElement.instances.get(providerAst.token.reference);
            bindInjectableDestroyLifecycleCallbacks(providerAst, providerInstance, compileElement);
        });
        return null;
    };
    ViewBinderVisitor.prototype.visitEmbeddedTemplate = function (ast, parent) {
        var compileElement = this.view.nodes[this._nodeIndex++];
        bindOutputs(ast.outputs, ast.directives, compileElement, false);
        ast.directives.forEach(function (directiveAst, dirIndex) {
            var directiveInstance = compileElement.instances.get(directiveAst.directive.type.reference);
            var directiveWrapperInstance = compileElement.directiveWrapperInstance.get(directiveAst.directive.type.reference);
            bindDirectiveInputs(directiveAst, directiveWrapperInstance, dirIndex, compileElement);
            bindDirectiveAfterContentLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
            bindDirectiveAfterViewLifecycleCallbacks(directiveAst.directive, directiveInstance, compileElement);
            bindDirectiveWrapperLifecycleCallbacks(directiveAst, directiveWrapperInstance, compileElement);
        });
        ast.providers.forEach(function (providerAst) {
            var providerInstance = compileElement.instances.get(providerAst.token.reference);
            bindInjectableDestroyLifecycleCallbacks(providerAst, providerInstance, compileElement);
        });
        bindView(compileElement.embeddedView, ast.children, this._schemaRegistry);
        return null;
    };
    ViewBinderVisitor.prototype.visitAttr = function (ast, ctx) { return null; };
    ViewBinderVisitor.prototype.visitDirective = function (ast, ctx) { return null; };
    ViewBinderVisitor.prototype.visitEvent = function (ast, eventTargetAndNames) {
        return null;
    };
    ViewBinderVisitor.prototype.visitReference = function (ast, ctx) { return null; };
    ViewBinderVisitor.prototype.visitVariable = function (ast, ctx) { return null; };
    ViewBinderVisitor.prototype.visitDirectiveProperty = function (ast, context) { return null; };
    ViewBinderVisitor.prototype.visitElementProperty = function (ast, context) { return null; };
    return ViewBinderVisitor;
}());
//# sourceMappingURL=view_binder.js.map