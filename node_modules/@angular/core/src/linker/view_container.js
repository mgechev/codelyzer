/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from './element_ref';
import { ViewContainerRef_ } from './view_container_ref';
import { ViewType } from './view_type';
/**
 * A ViewContainer is created for elements that have a ViewContainerRef
 * to keep track of the nested views.
 */
export var ViewContainer = (function () {
    function ViewContainer(index, parentIndex, parentView, nativeElement) {
        this.index = index;
        this.parentIndex = parentIndex;
        this.parentView = parentView;
        this.nativeElement = nativeElement;
    }
    Object.defineProperty(ViewContainer.prototype, "elementRef", {
        get: function () { return new ElementRef(this.nativeElement); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewContainer.prototype, "vcRef", {
        get: function () { return new ViewContainerRef_(this); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewContainer.prototype, "parentInjector", {
        get: function () { return this.parentView.injector(this.parentIndex); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewContainer.prototype, "injector", {
        get: function () { return this.parentView.injector(this.index); },
        enumerable: true,
        configurable: true
    });
    ViewContainer.prototype.detectChangesInNestedViews = function (throwOnChange) {
        if (this.nestedViews) {
            for (var i = 0; i < this.nestedViews.length; i++) {
                this.nestedViews[i].detectChanges(throwOnChange);
            }
        }
    };
    ViewContainer.prototype.destroyNestedViews = function () {
        if (this.nestedViews) {
            for (var i = 0; i < this.nestedViews.length; i++) {
                this.nestedViews[i].destroy();
            }
        }
    };
    ViewContainer.prototype.visitNestedViewRootNodes = function (cb, c) {
        if (this.nestedViews) {
            for (var i = 0; i < this.nestedViews.length; i++) {
                this.nestedViews[i].visitRootNodesInternal(cb, c);
            }
        }
    };
    ViewContainer.prototype.mapNestedViews = function (nestedViewClass, callback) {
        var result = [];
        if (this.nestedViews) {
            for (var i = 0; i < this.nestedViews.length; i++) {
                var nestedView = this.nestedViews[i];
                if (nestedView.clazz === nestedViewClass) {
                    result.push(callback(nestedView));
                }
            }
        }
        if (this.projectedViews) {
            for (var i = 0; i < this.projectedViews.length; i++) {
                var projectedView = this.projectedViews[i];
                if (projectedView.clazz === nestedViewClass) {
                    result.push(callback(projectedView));
                }
            }
        }
        return result;
    };
    ViewContainer.prototype.moveView = function (view, currentIndex) {
        var previousIndex = this.nestedViews.indexOf(view);
        if (view.type === ViewType.COMPONENT) {
            throw new Error("Component views can't be moved!");
        }
        var nestedViews = this.nestedViews;
        if (nestedViews == null) {
            nestedViews = [];
            this.nestedViews = nestedViews;
        }
        nestedViews.splice(previousIndex, 1);
        nestedViews.splice(currentIndex, 0, view);
        var prevView = currentIndex > 0 ? nestedViews[currentIndex - 1] : null;
        view.moveAfter(this, prevView);
    };
    ViewContainer.prototype.attachView = function (view, viewIndex) {
        if (view.type === ViewType.COMPONENT) {
            throw new Error("Component views can't be moved!");
        }
        var nestedViews = this.nestedViews;
        if (nestedViews == null) {
            nestedViews = [];
            this.nestedViews = nestedViews;
        }
        // perf: array.push is faster than array.splice!
        if (viewIndex >= nestedViews.length) {
            nestedViews.push(view);
        }
        else {
            nestedViews.splice(viewIndex, 0, view);
        }
        var prevView = viewIndex > 0 ? nestedViews[viewIndex - 1] : null;
        view.attachAfter(this, prevView);
    };
    ViewContainer.prototype.detachView = function (viewIndex) {
        var view = this.nestedViews[viewIndex];
        // perf: array.pop is faster than array.splice!
        if (viewIndex >= this.nestedViews.length - 1) {
            this.nestedViews.pop();
        }
        else {
            this.nestedViews.splice(viewIndex, 1);
        }
        if (view.type === ViewType.COMPONENT) {
            throw new Error("Component views can't be moved!");
        }
        view.detach();
        return view;
    };
    return ViewContainer;
}());
//# sourceMappingURL=view_container.js.map