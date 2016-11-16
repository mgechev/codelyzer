/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { ChangeDetectorStatus } from '../change_detection/change_detection';
import { THROW_IF_NOT_FOUND } from '../di/injector';
import { isPresent } from '../facade/lang';
import { wtfCreateScope, wtfLeave } from '../profile/profile';
import { AnimationViewContext } from './animation_view_context';
import { DebugContext } from './debug_context';
import { ElementInjector } from './element_injector';
import { ExpressionChangedAfterItHasBeenCheckedError, ViewDestroyedError, ViewWrappedError } from './errors';
import { ViewRef_ } from './view_ref';
import { ViewType } from './view_type';
import { addToArray } from './view_utils';
var _scope_check = wtfCreateScope("AppView#check(ascii id)");
/**
 * @experimental
 */
var EMPTY_CONTEXT = new Object();
var UNDEFINED = new Object();
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export var AppView = (function () {
    function AppView(clazz, componentType, type, viewUtils, parentView, parentIndex, parentElement, cdMode, declaredViewContainer) {
        if (declaredViewContainer === void 0) { declaredViewContainer = null; }
        this.clazz = clazz;
        this.componentType = componentType;
        this.type = type;
        this.viewUtils = viewUtils;
        this.parentView = parentView;
        this.parentIndex = parentIndex;
        this.parentElement = parentElement;
        this.cdMode = cdMode;
        this.declaredViewContainer = declaredViewContainer;
        this.viewContainer = null;
        this.numberOfChecks = 0;
        this.ref = new ViewRef_(this);
        if (type === ViewType.COMPONENT || type === ViewType.HOST) {
            this.renderer = viewUtils.renderComponent(componentType);
        }
        else {
            this.renderer = parentView.renderer;
        }
        this._directRenderer = this.renderer.directRenderer;
    }
    Object.defineProperty(AppView.prototype, "animationContext", {
        get: function () {
            if (!this._animationContext) {
                this._animationContext = new AnimationViewContext();
            }
            return this._animationContext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppView.prototype, "destroyed", {
        get: function () { return this.cdMode === ChangeDetectorStatus.Destroyed; },
        enumerable: true,
        configurable: true
    });
    AppView.prototype.create = function (context) {
        this.context = context;
        return this.createInternal(null);
    };
    AppView.prototype.createHostView = function (rootSelectorOrNode, hostInjector, projectableNodes) {
        this.context = EMPTY_CONTEXT;
        this._hasExternalHostElement = isPresent(rootSelectorOrNode);
        this._hostInjector = hostInjector;
        this._hostProjectableNodes = projectableNodes;
        return this.createInternal(rootSelectorOrNode);
    };
    /**
     * Overwritten by implementations.
     * Returns the ComponentRef for the host element for ViewType.HOST.
     */
    AppView.prototype.createInternal = function (rootSelectorOrNode) { return null; };
    /**
     * Overwritten by implementations.
     */
    AppView.prototype.createEmbeddedViewInternal = function (templateNodeIndex) { return null; };
    AppView.prototype.init = function (lastRootNode, allNodes, disposables) {
        this.lastRootNode = lastRootNode;
        this.allNodes = allNodes;
        this.disposables = disposables;
        if (this.type === ViewType.COMPONENT) {
            this.dirtyParentQueriesInternal();
        }
    };
    AppView.prototype.injectorGet = function (token, nodeIndex, notFoundValue) {
        if (notFoundValue === void 0) { notFoundValue = THROW_IF_NOT_FOUND; }
        var result = UNDEFINED;
        var view = this;
        while (result === UNDEFINED) {
            if (isPresent(nodeIndex)) {
                result = view.injectorGetInternal(token, nodeIndex, UNDEFINED);
            }
            if (result === UNDEFINED && view.type === ViewType.HOST) {
                result = view._hostInjector.get(token, notFoundValue);
            }
            nodeIndex = view.parentIndex;
            view = view.parentView;
        }
        return result;
    };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.injectorGetInternal = function (token, nodeIndex, notFoundResult) {
        return notFoundResult;
    };
    AppView.prototype.injector = function (nodeIndex) { return new ElementInjector(this, nodeIndex); };
    AppView.prototype.detachAndDestroy = function () {
        if (this._hasExternalHostElement) {
            this.detach();
        }
        else if (isPresent(this.viewContainer)) {
            this.viewContainer.detachView(this.viewContainer.nestedViews.indexOf(this));
        }
        this.destroy();
    };
    AppView.prototype.destroy = function () {
        var _this = this;
        if (this.cdMode === ChangeDetectorStatus.Destroyed) {
            return;
        }
        var hostElement = this.type === ViewType.COMPONENT ? this.parentElement : null;
        if (this.disposables) {
            for (var i = 0; i < this.disposables.length; i++) {
                this.disposables[i]();
            }
        }
        this.destroyInternal();
        this.dirtyParentQueriesInternal();
        if (this._animationContext) {
            this._animationContext.onAllActiveAnimationsDone(function () { return _this.renderer.destroyView(hostElement, _this.allNodes); });
        }
        else {
            this.renderer.destroyView(hostElement, this.allNodes);
        }
        this.cdMode = ChangeDetectorStatus.Destroyed;
    };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.destroyInternal = function () { };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.detachInternal = function () { };
    AppView.prototype.detach = function () {
        var _this = this;
        this.detachInternal();
        if (this._animationContext) {
            this._animationContext.onAllActiveAnimationsDone(function () { return _this._renderDetach(); });
        }
        else {
            this._renderDetach();
        }
        if (this.declaredViewContainer && this.declaredViewContainer !== this.viewContainer) {
            var projectedViews = this.declaredViewContainer.projectedViews;
            var index = projectedViews.indexOf(this);
            // perf: pop is faster than splice!
            if (index >= projectedViews.length - 1) {
                projectedViews.pop();
            }
            else {
                projectedViews.splice(index, 1);
            }
        }
        this.viewContainer = null;
        this.dirtyParentQueriesInternal();
    };
    AppView.prototype._renderDetach = function () {
        if (this._directRenderer) {
            this.visitRootNodesInternal(this._directRenderer.remove, null);
        }
        else {
            this.renderer.detachView(this.flatRootNodes);
        }
    };
    AppView.prototype.attachAfter = function (viewContainer, prevView) {
        this._renderAttach(viewContainer, prevView);
        this.viewContainer = viewContainer;
        if (this.declaredViewContainer && this.declaredViewContainer !== viewContainer) {
            if (!this.declaredViewContainer.projectedViews) {
                this.declaredViewContainer.projectedViews = [];
            }
            this.declaredViewContainer.projectedViews.push(this);
        }
        this.dirtyParentQueriesInternal();
    };
    AppView.prototype.moveAfter = function (viewContainer, prevView) {
        this._renderAttach(viewContainer, prevView);
        this.dirtyParentQueriesInternal();
    };
    AppView.prototype._renderAttach = function (viewContainer, prevView) {
        var prevNode = prevView ? prevView.lastRootNode : viewContainer.nativeElement;
        if (this._directRenderer) {
            var nextSibling = this._directRenderer.nextSibling(prevNode);
            if (nextSibling) {
                this.visitRootNodesInternal(this._directRenderer.insertBefore, nextSibling);
            }
            else {
                this.visitRootNodesInternal(this._directRenderer.appendChild, this._directRenderer.parentElement(prevNode));
            }
        }
        else {
            this.renderer.attachViewAfter(prevNode, this.flatRootNodes);
        }
    };
    Object.defineProperty(AppView.prototype, "changeDetectorRef", {
        get: function () { return this.ref; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppView.prototype, "flatRootNodes", {
        get: function () {
            var nodes = [];
            this.visitRootNodesInternal(addToArray, nodes);
            return nodes;
        },
        enumerable: true,
        configurable: true
    });
    AppView.prototype.projectNodes = function (parentElement, ngContentIndex) {
        if (this._directRenderer) {
            this.visitProjectedNodes(ngContentIndex, this._directRenderer.appendChild, parentElement);
        }
        else {
            var nodes = [];
            this.visitProjectedNodes(ngContentIndex, addToArray, nodes);
            this.renderer.projectNodes(parentElement, nodes);
        }
    };
    AppView.prototype.visitProjectedNodes = function (ngContentIndex, cb, c) {
        switch (this.type) {
            case ViewType.EMBEDDED:
                this.parentView.visitProjectedNodes(ngContentIndex, cb, c);
                break;
            case ViewType.COMPONENT:
                if (this.parentView.type === ViewType.HOST) {
                    var nodes = this.parentView._hostProjectableNodes[ngContentIndex] || [];
                    for (var i = 0; i < nodes.length; i++) {
                        cb(nodes[i], c);
                    }
                }
                else {
                    this.parentView.visitProjectableNodesInternal(this.parentIndex, ngContentIndex, cb, c);
                }
                break;
        }
    };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.visitRootNodesInternal = function (cb, c) { };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.visitProjectableNodesInternal = function (nodeIndex, ngContentIndex, cb, c) { };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.dirtyParentQueriesInternal = function () { };
    AppView.prototype.detectChanges = function (throwOnChange) {
        var s = _scope_check(this.clazz);
        if (this.cdMode === ChangeDetectorStatus.Checked ||
            this.cdMode === ChangeDetectorStatus.Errored ||
            this.cdMode === ChangeDetectorStatus.Detached)
            return;
        if (this.cdMode === ChangeDetectorStatus.Destroyed) {
            this.throwDestroyedError('detectChanges');
        }
        this.detectChangesInternal(throwOnChange);
        if (this.cdMode === ChangeDetectorStatus.CheckOnce)
            this.cdMode = ChangeDetectorStatus.Checked;
        this.numberOfChecks++;
        wtfLeave(s);
    };
    /**
     * Overwritten by implementations
     */
    AppView.prototype.detectChangesInternal = function (throwOnChange) { };
    AppView.prototype.markAsCheckOnce = function () { this.cdMode = ChangeDetectorStatus.CheckOnce; };
    AppView.prototype.markPathToRootAsCheckOnce = function () {
        var c = this;
        while (isPresent(c) && c.cdMode !== ChangeDetectorStatus.Detached) {
            if (c.cdMode === ChangeDetectorStatus.Checked) {
                c.cdMode = ChangeDetectorStatus.CheckOnce;
            }
            if (c.type === ViewType.COMPONENT) {
                c = c.parentView;
            }
            else {
                c = c.viewContainer ? c.viewContainer.parentView : null;
            }
        }
    };
    AppView.prototype.eventHandler = function (cb) {
        return cb;
    };
    AppView.prototype.throwDestroyedError = function (details) { throw new ViewDestroyedError(details); };
    return AppView;
}());
export var DebugAppView = (function (_super) {
    __extends(DebugAppView, _super);
    function DebugAppView(clazz, componentType, type, viewUtils, parentView, parentIndex, parentNode, cdMode, staticNodeDebugInfos, declaredViewContainer) {
        if (declaredViewContainer === void 0) { declaredViewContainer = null; }
        _super.call(this, clazz, componentType, type, viewUtils, parentView, parentIndex, parentNode, cdMode, declaredViewContainer);
        this.staticNodeDebugInfos = staticNodeDebugInfos;
        this._currentDebugContext = null;
    }
    DebugAppView.prototype.create = function (context) {
        this._resetDebug();
        try {
            return _super.prototype.create.call(this, context);
        }
        catch (e) {
            this._rethrowWithContext(e);
            throw e;
        }
    };
    DebugAppView.prototype.createHostView = function (rootSelectorOrNode, injector, projectableNodes) {
        if (projectableNodes === void 0) { projectableNodes = null; }
        this._resetDebug();
        try {
            return _super.prototype.createHostView.call(this, rootSelectorOrNode, injector, projectableNodes);
        }
        catch (e) {
            this._rethrowWithContext(e);
            throw e;
        }
    };
    DebugAppView.prototype.injectorGet = function (token, nodeIndex, notFoundResult) {
        this._resetDebug();
        try {
            return _super.prototype.injectorGet.call(this, token, nodeIndex, notFoundResult);
        }
        catch (e) {
            this._rethrowWithContext(e);
            throw e;
        }
    };
    DebugAppView.prototype.detach = function () {
        this._resetDebug();
        try {
            _super.prototype.detach.call(this);
        }
        catch (e) {
            this._rethrowWithContext(e);
            throw e;
        }
    };
    DebugAppView.prototype.destroy = function () {
        this._resetDebug();
        try {
            _super.prototype.destroy.call(this);
        }
        catch (e) {
            this._rethrowWithContext(e);
            throw e;
        }
    };
    DebugAppView.prototype.detectChanges = function (throwOnChange) {
        this._resetDebug();
        try {
            _super.prototype.detectChanges.call(this, throwOnChange);
        }
        catch (e) {
            this._rethrowWithContext(e);
            throw e;
        }
    };
    DebugAppView.prototype._resetDebug = function () { this._currentDebugContext = null; };
    DebugAppView.prototype.debug = function (nodeIndex, rowNum, colNum) {
        return this._currentDebugContext = new DebugContext(this, nodeIndex, rowNum, colNum);
    };
    DebugAppView.prototype._rethrowWithContext = function (e) {
        if (!(e instanceof ViewWrappedError)) {
            if (!(e instanceof ExpressionChangedAfterItHasBeenCheckedError)) {
                this.cdMode = ChangeDetectorStatus.Errored;
            }
            if (isPresent(this._currentDebugContext)) {
                throw new ViewWrappedError(e, this._currentDebugContext);
            }
        }
    };
    DebugAppView.prototype.eventHandler = function (cb) {
        var _this = this;
        var superHandler = _super.prototype.eventHandler.call(this, cb);
        return function (eventName, event) {
            _this._resetDebug();
            try {
                return superHandler.call(_this, eventName, event);
            }
            catch (e) {
                _this._rethrowWithContext(e);
                throw e;
            }
        };
    };
    return DebugAppView;
}(AppView));
//# sourceMappingURL=view.js.map