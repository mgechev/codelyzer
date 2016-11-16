/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectorRef, ChangeDetectorStatus } from '../change_detection/change_detection';
import { Injector } from '../di/injector';
import { RenderComponentType, Renderer } from '../render/api';
import { AnimationViewContext } from './animation_view_context';
import { ComponentRef } from './component_factory';
import { DebugContext, StaticNodeDebugInfo } from './debug_context';
import { ViewContainer } from './view_container';
import { ViewRef_ } from './view_ref';
import { ViewType } from './view_type';
import { ViewUtils } from './view_utils';
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export declare abstract class AppView<T> {
    clazz: any;
    componentType: RenderComponentType;
    type: ViewType;
    viewUtils: ViewUtils;
    parentView: AppView<any>;
    parentIndex: number;
    parentElement: any;
    cdMode: ChangeDetectorStatus;
    declaredViewContainer: ViewContainer;
    ref: ViewRef_<T>;
    lastRootNode: any;
    allNodes: any[];
    disposables: Function[];
    viewContainer: ViewContainer;
    numberOfChecks: number;
    renderer: Renderer;
    private _hasExternalHostElement;
    private _hostInjector;
    private _hostProjectableNodes;
    private _animationContext;
    private _directRenderer;
    context: T;
    constructor(clazz: any, componentType: RenderComponentType, type: ViewType, viewUtils: ViewUtils, parentView: AppView<any>, parentIndex: number, parentElement: any, cdMode: ChangeDetectorStatus, declaredViewContainer?: ViewContainer);
    animationContext: AnimationViewContext;
    destroyed: boolean;
    create(context: T): ComponentRef<any>;
    createHostView(rootSelectorOrNode: string | any, hostInjector: Injector, projectableNodes: any[][]): ComponentRef<any>;
    /**
     * Overwritten by implementations.
     * Returns the ComponentRef for the host element for ViewType.HOST.
     */
    createInternal(rootSelectorOrNode: string | any): ComponentRef<any>;
    /**
     * Overwritten by implementations.
     */
    createEmbeddedViewInternal(templateNodeIndex: number): AppView<any>;
    init(lastRootNode: any, allNodes: any[], disposables: Function[]): void;
    injectorGet(token: any, nodeIndex: number, notFoundValue?: any): any;
    /**
     * Overwritten by implementations
     */
    injectorGetInternal(token: any, nodeIndex: number, notFoundResult: any): any;
    injector(nodeIndex: number): Injector;
    detachAndDestroy(): void;
    destroy(): void;
    /**
     * Overwritten by implementations
     */
    destroyInternal(): void;
    /**
     * Overwritten by implementations
     */
    detachInternal(): void;
    detach(): void;
    private _renderDetach();
    attachAfter(viewContainer: ViewContainer, prevView: AppView<any>): void;
    moveAfter(viewContainer: ViewContainer, prevView: AppView<any>): void;
    private _renderAttach(viewContainer, prevView);
    changeDetectorRef: ChangeDetectorRef;
    flatRootNodes: any[];
    projectNodes(parentElement: any, ngContentIndex: number): void;
    visitProjectedNodes<C>(ngContentIndex: number, cb: (node: any, ctx: C) => void, c: C): void;
    /**
     * Overwritten by implementations
     */
    visitRootNodesInternal<C>(cb: (node: any, ctx: C) => void, c: C): void;
    /**
     * Overwritten by implementations
     */
    visitProjectableNodesInternal<C>(nodeIndex: number, ngContentIndex: number, cb: (node: any, ctx: C) => void, c: C): void;
    /**
     * Overwritten by implementations
     */
    dirtyParentQueriesInternal(): void;
    detectChanges(throwOnChange: boolean): void;
    /**
     * Overwritten by implementations
     */
    detectChangesInternal(throwOnChange: boolean): void;
    markAsCheckOnce(): void;
    markPathToRootAsCheckOnce(): void;
    eventHandler<E, R>(cb: (eventName: string, event?: E) => R): (eventName: string, event?: E) => R;
    throwDestroyedError(details: string): void;
}
export declare class DebugAppView<T> extends AppView<T> {
    staticNodeDebugInfos: StaticNodeDebugInfo[];
    private _currentDebugContext;
    constructor(clazz: any, componentType: RenderComponentType, type: ViewType, viewUtils: ViewUtils, parentView: AppView<any>, parentIndex: number, parentNode: any, cdMode: ChangeDetectorStatus, staticNodeDebugInfos: StaticNodeDebugInfo[], declaredViewContainer?: ViewContainer);
    create(context: T): ComponentRef<any>;
    createHostView(rootSelectorOrNode: string | any, injector: Injector, projectableNodes?: any[][]): ComponentRef<any>;
    injectorGet(token: any, nodeIndex: number, notFoundResult?: any): any;
    detach(): void;
    destroy(): void;
    detectChanges(throwOnChange: boolean): void;
    private _resetDebug();
    debug(nodeIndex: number, rowNum: number, colNum: number): DebugContext;
    private _rethrowWithContext(e);
    eventHandler<E, R>(cb: (eventName: string, event?: E) => R): (eventName: string, event?: E) => R;
}
