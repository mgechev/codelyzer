/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompileIdentifierMetadata } from '../compile_metadata';
import { EventHandlerVars } from '../compiler_util/expression_converter';
import { isPresent } from '../facade/lang';
import * as o from '../output/output_ast';
import { ViewType } from '../private_import_core';
import { CompileMethod } from './compile_method';
import { CompilePipe } from './compile_pipe';
import { CompileQuery, addQueryToTokenMap, createQueryList } from './compile_query';
import { getPropertyInView, getViewClassName } from './util';
export var CompileViewRootNodeType;
(function (CompileViewRootNodeType) {
    CompileViewRootNodeType[CompileViewRootNodeType["Node"] = 0] = "Node";
    CompileViewRootNodeType[CompileViewRootNodeType["ViewContainer"] = 1] = "ViewContainer";
    CompileViewRootNodeType[CompileViewRootNodeType["NgContent"] = 2] = "NgContent";
})(CompileViewRootNodeType || (CompileViewRootNodeType = {}));
export var CompileViewRootNode = (function () {
    function CompileViewRootNode(type, expr, ngContentIndex) {
        this.type = type;
        this.expr = expr;
        this.ngContentIndex = ngContentIndex;
    }
    return CompileViewRootNode;
}());
export var CompileView = (function () {
    function CompileView(component, genConfig, pipeMetas, styles, animations, viewIndex, declarationElement, templateVariableBindings) {
        var _this = this;
        this.component = component;
        this.genConfig = genConfig;
        this.pipeMetas = pipeMetas;
        this.styles = styles;
        this.animations = animations;
        this.viewIndex = viewIndex;
        this.declarationElement = declarationElement;
        this.templateVariableBindings = templateVariableBindings;
        this.viewChildren = [];
        this.nodes = [];
        this.rootNodes = [];
        this.lastRenderNode = o.NULL_EXPR;
        this.viewContainers = [];
        this.methods = [];
        this.ctorStmts = [];
        this.fields = [];
        this.getters = [];
        this.disposables = [];
        this.purePipes = new Map();
        this.pipes = [];
        this.locals = new Map();
        this.literalArrayCount = 0;
        this.literalMapCount = 0;
        this.pipeCount = 0;
        this.createMethod = new CompileMethod(this);
        this.animationBindingsMethod = new CompileMethod(this);
        this.injectorGetMethod = new CompileMethod(this);
        this.updateContentQueriesMethod = new CompileMethod(this);
        this.dirtyParentQueriesMethod = new CompileMethod(this);
        this.updateViewQueriesMethod = new CompileMethod(this);
        this.detectChangesInInputsMethod = new CompileMethod(this);
        this.detectChangesRenderPropertiesMethod = new CompileMethod(this);
        this.afterContentLifecycleCallbacksMethod = new CompileMethod(this);
        this.afterViewLifecycleCallbacksMethod = new CompileMethod(this);
        this.destroyMethod = new CompileMethod(this);
        this.detachMethod = new CompileMethod(this);
        this.viewType = getViewType(component, viewIndex);
        this.className = getViewClassName(component, viewIndex);
        this.classType = o.importType(new CompileIdentifierMetadata({ name: this.className }));
        this.classExpr = o.variable(this.className);
        if (this.viewType === ViewType.COMPONENT || this.viewType === ViewType.HOST) {
            this.componentView = this;
        }
        else {
            this.componentView = this.declarationElement.view.componentView;
        }
        this.componentContext =
            getPropertyInView(o.THIS_EXPR.prop('context'), this, this.componentView);
        var viewQueries = new Map();
        if (this.viewType === ViewType.COMPONENT) {
            var directiveInstance_1 = o.THIS_EXPR.prop('context');
            this.component.viewQueries.forEach(function (queryMeta, queryIndex) {
                var propName = "_viewQuery_" + queryMeta.selectors[0].name + "_" + queryIndex;
                var queryList = createQueryList(queryMeta, directiveInstance_1, propName, _this);
                var query = new CompileQuery(queryMeta, queryList, directiveInstance_1, _this);
                addQueryToTokenMap(viewQueries, query);
            });
        }
        this.viewQueries = viewQueries;
        templateVariableBindings.forEach(function (entry) { _this.locals.set(entry[1], o.THIS_EXPR.prop('context').prop(entry[0])); });
        if (!this.declarationElement.isNull()) {
            this.declarationElement.setEmbeddedView(this);
        }
    }
    CompileView.prototype.callPipe = function (name, input, args) {
        return CompilePipe.call(this, name, [input].concat(args));
    };
    CompileView.prototype.getLocal = function (name) {
        if (name == EventHandlerVars.event.name) {
            return EventHandlerVars.event;
        }
        var currView = this;
        var result = currView.locals.get(name);
        while (!result && isPresent(currView.declarationElement.view)) {
            currView = currView.declarationElement.view;
            result = currView.locals.get(name);
        }
        if (isPresent(result)) {
            return getPropertyInView(result, this, currView);
        }
        else {
            return null;
        }
    };
    CompileView.prototype.afterNodes = function () {
        var _this = this;
        Array.from(this.viewQueries.values())
            .forEach(function (queries) { return queries.forEach(function (q) { return q.afterChildren(_this.createMethod, _this.updateViewQueriesMethod); }); });
    };
    return CompileView;
}());
function getViewType(component, embeddedTemplateIndex) {
    if (embeddedTemplateIndex > 0) {
        return ViewType.EMBEDDED;
    }
    if (component.type.isHost) {
        return ViewType.HOST;
    }
    return ViewType.COMPONENT;
}
//# sourceMappingURL=compile_view.js.map