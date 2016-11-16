/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector } from '../di/injector';
import { ElementRef } from './element_ref';
import { AppView } from './view';
import { ViewContainerRef_ } from './view_container_ref';
/**
 * A ViewContainer is created for elements that have a ViewContainerRef
 * to keep track of the nested views.
 */
export declare class ViewContainer {
    index: number;
    parentIndex: number;
    parentView: AppView<any>;
    nativeElement: any;
    nestedViews: AppView<any>[];
    projectedViews: AppView<any>[];
    constructor(index: number, parentIndex: number, parentView: AppView<any>, nativeElement: any);
    elementRef: ElementRef;
    vcRef: ViewContainerRef_;
    parentInjector: Injector;
    injector: Injector;
    detectChangesInNestedViews(throwOnChange: boolean): void;
    destroyNestedViews(): void;
    visitNestedViewRootNodes<C>(cb: (node: any, ctx: C) => void, c: C): void;
    mapNestedViews(nestedViewClass: any, callback: Function): any[];
    moveView(view: AppView<any>, currentIndex: number): void;
    attachView(view: AppView<any>, viewIndex: number): void;
    detachView(viewIndex: number): AppView<any>;
}
