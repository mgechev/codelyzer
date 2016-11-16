/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { devModeEqual } from '../change_detection/change_detection';
import { UNINITIALIZED } from '../change_detection/change_detection_util';
import { Injectable } from '../di';
import { isPresent, looseIdentical } from '../facade/lang';
import { RenderComponentType, RootRenderer } from '../render/api';
import { Sanitizer } from '../security';
import { ExpressionChangedAfterItHasBeenCheckedError } from './errors';
export var ViewUtils = (function () {
    function ViewUtils(_renderer, sanitizer) {
        this._renderer = _renderer;
        this._nextCompTypeId = 0;
        this.sanitizer = sanitizer;
    }
    /** @internal */
    ViewUtils.prototype.renderComponent = function (renderComponentType) {
        return this._renderer.renderComponent(renderComponentType);
    };
    ViewUtils.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    ViewUtils.ctorParameters = [
        { type: RootRenderer, },
        { type: Sanitizer, },
    ];
    return ViewUtils;
}());
var nextRenderComponentTypeId = 0;
export function createRenderComponentType(templateUrl, slotCount, encapsulation, styles, animations) {
    return new RenderComponentType("" + nextRenderComponentTypeId++, templateUrl, slotCount, encapsulation, styles, animations);
}
export function addToArray(e, array) {
    array.push(e);
}
export function interpolate(valueCount, constAndInterp) {
    var result = '';
    for (var i = 0; i < valueCount * 2; i = i + 2) {
        result = result + constAndInterp[i] + _toStringWithNull(constAndInterp[i + 1]);
    }
    return result + constAndInterp[valueCount * 2];
}
export function inlineInterpolate(valueCount, c0, a1, c1, a2, c2, a3, c3, a4, c4, a5, c5, a6, c6, a7, c7, a8, c8, a9, c9) {
    switch (valueCount) {
        case 1:
            return c0 + _toStringWithNull(a1) + c1;
        case 2:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2;
        case 3:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3;
        case 4:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3 + _toStringWithNull(a4) + c4;
        case 5:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5;
        case 6:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) + c6;
        case 7:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                c6 + _toStringWithNull(a7) + c7;
        case 8:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8;
        case 9:
            return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8 + _toStringWithNull(a9) + c9;
        default:
            throw new Error("Does not support more than 9 expressions");
    }
}
function _toStringWithNull(v) {
    return v != null ? v.toString() : '';
}
export function checkBinding(throwOnChange, oldValue, newValue) {
    if (throwOnChange) {
        if (!devModeEqual(oldValue, newValue)) {
            throw new ExpressionChangedAfterItHasBeenCheckedError(oldValue, newValue);
        }
        return false;
    }
    else {
        return !looseIdentical(oldValue, newValue);
    }
}
export function castByValue(input, value) {
    return input;
}
export var EMPTY_ARRAY = [];
export var EMPTY_MAP = {};
export function pureProxy1(fn) {
    var result;
    var v0 = UNINITIALIZED;
    return function (p0) {
        if (!looseIdentical(v0, p0)) {
            v0 = p0;
            result = fn(p0);
        }
        return result;
    };
}
export function pureProxy2(fn) {
    var result;
    var v0 = UNINITIALIZED;
    var v1 = UNINITIALIZED;
    return function (p0, p1) {
        if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1)) {
            v0 = p0;
            v1 = p1;
            result = fn(p0, p1);
        }
        return result;
    };
}
export function pureProxy3(fn) {
    var result;
    var v0 = UNINITIALIZED;
    var v1 = UNINITIALIZED;
    var v2 = UNINITIALIZED;
    return function (p0, p1, p2) {
        if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2)) {
            v0 = p0;
            v1 = p1;
            v2 = p2;
            result = fn(p0, p1, p2);
        }
        return result;
    };
}
export function pureProxy4(fn) {
    var result;
    var v0, v1, v2, v3;
    v0 = v1 = v2 = v3 = UNINITIALIZED;
    return function (p0, p1, p2, p3) {
        if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
            !looseIdentical(v3, p3)) {
            v0 = p0;
            v1 = p1;
            v2 = p2;
            v3 = p3;
            result = fn(p0, p1, p2, p3);
        }
        return result;
    };
}
export function pureProxy5(fn) {
    var result;
    var v0, v1, v2, v3, v4;
    v0 = v1 = v2 = v3 = v4 = UNINITIALIZED;
    return function (p0, p1, p2, p3, p4) {
        if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
            !looseIdentical(v3, p3) || !looseIdentical(v4, p4)) {
            v0 = p0;
            v1 = p1;
            v2 = p2;
            v3 = p3;
            v4 = p4;
            result = fn(p0, p1, p2, p3, p4);
        }
        return result;
    };
}
export function pureProxy6(fn) {
    var result;
    var v0, v1, v2, v3, v4, v5;
    v0 = v1 = v2 = v3 = v4 = v5 = UNINITIALIZED;
    return function (p0, p1, p2, p3, p4, p5) {
        if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
            !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5)) {
            v0 = p0;
            v1 = p1;
            v2 = p2;
            v3 = p3;
            v4 = p4;
            v5 = p5;
            result = fn(p0, p1, p2, p3, p4, p5);
        }
        return result;
    };
}
export function pureProxy7(fn) {
    var result;
    var v0, v1, v2, v3, v4, v5, v6;
    v0 = v1 = v2 = v3 = v4 = v5 = v6 = UNINITIALIZED;
    return function (p0, p1, p2, p3, p4, p5, p6) {
        if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
            !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) ||
            !looseIdentical(v6, p6)) {
            v0 = p0;
            v1 = p1;
            v2 = p2;
            v3 = p3;
            v4 = p4;
            v5 = p5;
            v6 = p6;
            result = fn(p0, p1, p2, p3, p4, p5, p6);
        }
        return result;
    };
}
export function pureProxy8(fn) {
    var result;
    var v0, v1, v2, v3, v4, v5, v6, v7;
    v0 = v1 = v2 = v3 = v4 = v5 = v6 = v7 = UNINITIALIZED;
    return function (p0, p1, p2, p3, p4, p5, p6, p7) {
        if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
            !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) ||
            !looseIdentical(v6, p6) || !looseIdentical(v7, p7)) {
            v0 = p0;
            v1 = p1;
            v2 = p2;
            v3 = p3;
            v4 = p4;
            v5 = p5;
            v6 = p6;
            v7 = p7;
            result = fn(p0, p1, p2, p3, p4, p5, p6, p7);
        }
        return result;
    };
}
export function pureProxy9(fn) {
    var result;
    var v0, v1, v2, v3, v4, v5, v6, v7, v8;
    v0 = v1 = v2 = v3 = v4 = v5 = v6 = v7 = v8 = UNINITIALIZED;
    return function (p0, p1, p2, p3, p4, p5, p6, p7, p8) {
        if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
            !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) ||
            !looseIdentical(v6, p6) || !looseIdentical(v7, p7) || !looseIdentical(v8, p8)) {
            v0 = p0;
            v1 = p1;
            v2 = p2;
            v3 = p3;
            v4 = p4;
            v5 = p5;
            v6 = p6;
            v7 = p7;
            v8 = p8;
            result = fn(p0, p1, p2, p3, p4, p5, p6, p7, p8);
        }
        return result;
    };
}
export function pureProxy10(fn) {
    var result;
    var v0, v1, v2, v3, v4, v5, v6, v7, v8, v9;
    v0 = v1 = v2 = v3 = v4 = v5 = v6 = v7 = v8 = v9 = UNINITIALIZED;
    return function (p0, p1, p2, p3, p4, p5, p6, p7, p8, p9) {
        if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
            !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) ||
            !looseIdentical(v6, p6) || !looseIdentical(v7, p7) || !looseIdentical(v8, p8) ||
            !looseIdentical(v9, p9)) {
            v0 = p0;
            v1 = p1;
            v2 = p2;
            v3 = p3;
            v4 = p4;
            v5 = p5;
            v6 = p6;
            v7 = p7;
            v8 = p8;
            v9 = p9;
            result = fn(p0, p1, p2, p3, p4, p5, p6, p7, p8, p9);
        }
        return result;
    };
}
export function setBindingDebugInfoForChanges(renderer, el, changes) {
    Object.keys(changes).forEach(function (propName) {
        setBindingDebugInfo(renderer, el, propName, changes[propName].currentValue);
    });
}
export function setBindingDebugInfo(renderer, el, propName, value) {
    try {
        renderer.setBindingDebugInfo(el, "ng-reflect-" + camelCaseToDashCase(propName), value ? value.toString() : null);
    }
    catch (e) {
        renderer.setBindingDebugInfo(el, "ng-reflect-" + camelCaseToDashCase(propName), '[ERROR] Exception while trying to serialize the value');
    }
}
var CAMEL_CASE_REGEXP = /([A-Z])/g;
function camelCaseToDashCase(input) {
    return input.replace(CAMEL_CASE_REGEXP, function () {
        var m = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            m[_i - 0] = arguments[_i];
        }
        return '-' + m[1].toLowerCase();
    });
}
export function createRenderElement(renderer, parentElement, name, attrs, debugInfo) {
    var el = renderer.createElement(parentElement, name, debugInfo);
    for (var i = 0; i < attrs.length; i += 2) {
        renderer.setElementAttribute(el, attrs.get(i), attrs.get(i + 1));
    }
    return el;
}
export function selectOrCreateRenderHostElement(renderer, elementName, attrs, rootSelectorOrNode, debugInfo) {
    var hostElement;
    if (isPresent(rootSelectorOrNode)) {
        hostElement = renderer.selectRootElement(rootSelectorOrNode, debugInfo);
        for (var i = 0; i < attrs.length; i += 2) {
            renderer.setElementAttribute(hostElement, attrs.get(i), attrs.get(i + 1));
        }
    }
    else {
        hostElement = createRenderElement(renderer, null, elementName, attrs, debugInfo);
    }
    return hostElement;
}
export function subscribeToRenderElement(view, element, eventNamesAndTargets, listener) {
    var disposables = createEmptyInlineArray(eventNamesAndTargets.length / 2);
    for (var i = 0; i < eventNamesAndTargets.length; i += 2) {
        var eventName = eventNamesAndTargets.get(i);
        var eventTarget = eventNamesAndTargets.get(i + 1);
        var disposable = void 0;
        if (eventTarget) {
            disposable = view.renderer.listenGlobal(eventTarget, eventName, listener.bind(view, eventTarget + ":" + eventName));
        }
        else {
            disposable = view.renderer.listen(element, eventName, listener.bind(view, eventName));
        }
        disposables.set(i / 2, disposable);
    }
    return disposeInlineArray.bind(null, disposables);
}
function disposeInlineArray(disposables) {
    for (var i = 0; i < disposables.length; i++) {
        disposables.get(i)();
    }
}
export function noop() { }
function createEmptyInlineArray(length) {
    var ctor;
    if (length <= 2) {
        ctor = InlineArray2;
    }
    else if (length <= 4) {
        ctor = InlineArray4;
    }
    else if (length <= 8) {
        ctor = InlineArray8;
    }
    else if (length <= 16) {
        ctor = InlineArray16;
    }
    else {
        ctor = InlineArrayDynamic;
    }
    return new ctor(length);
}
var InlineArray0 = (function () {
    function InlineArray0() {
        this.length = 0;
    }
    InlineArray0.prototype.get = function (index) { return undefined; };
    InlineArray0.prototype.set = function (index, value) { };
    return InlineArray0;
}());
export var InlineArray2 = (function () {
    function InlineArray2(length, _v0, _v1) {
        this.length = length;
        this._v0 = _v0;
        this._v1 = _v1;
    }
    InlineArray2.prototype.get = function (index) {
        switch (index) {
            case 0:
                return this._v0;
            case 1:
                return this._v1;
            default:
                return undefined;
        }
    };
    InlineArray2.prototype.set = function (index, value) {
        switch (index) {
            case 0:
                this._v0 = value;
                break;
            case 1:
                this._v1 = value;
                break;
        }
    };
    return InlineArray2;
}());
export var InlineArray4 = (function () {
    function InlineArray4(length, _v0, _v1, _v2, _v3) {
        this.length = length;
        this._v0 = _v0;
        this._v1 = _v1;
        this._v2 = _v2;
        this._v3 = _v3;
    }
    InlineArray4.prototype.get = function (index) {
        switch (index) {
            case 0:
                return this._v0;
            case 1:
                return this._v1;
            case 2:
                return this._v2;
            case 3:
                return this._v3;
            default:
                return undefined;
        }
    };
    InlineArray4.prototype.set = function (index, value) {
        switch (index) {
            case 0:
                this._v0 = value;
                break;
            case 1:
                this._v1 = value;
                break;
            case 2:
                this._v2 = value;
                break;
            case 3:
                this._v3 = value;
                break;
        }
    };
    return InlineArray4;
}());
export var InlineArray8 = (function () {
    function InlineArray8(length, _v0, _v1, _v2, _v3, _v4, _v5, _v6, _v7) {
        this.length = length;
        this._v0 = _v0;
        this._v1 = _v1;
        this._v2 = _v2;
        this._v3 = _v3;
        this._v4 = _v4;
        this._v5 = _v5;
        this._v6 = _v6;
        this._v7 = _v7;
    }
    InlineArray8.prototype.get = function (index) {
        switch (index) {
            case 0:
                return this._v0;
            case 1:
                return this._v1;
            case 2:
                return this._v2;
            case 3:
                return this._v3;
            case 4:
                return this._v4;
            case 5:
                return this._v5;
            case 6:
                return this._v6;
            case 7:
                return this._v7;
            default:
                return undefined;
        }
    };
    InlineArray8.prototype.set = function (index, value) {
        switch (index) {
            case 0:
                this._v0 = value;
                break;
            case 1:
                this._v1 = value;
                break;
            case 2:
                this._v2 = value;
                break;
            case 3:
                this._v3 = value;
                break;
            case 4:
                this._v4 = value;
                break;
            case 5:
                this._v5 = value;
                break;
            case 6:
                this._v6 = value;
                break;
            case 7:
                this._v7 = value;
                break;
        }
    };
    return InlineArray8;
}());
export var InlineArray16 = (function () {
    function InlineArray16(length, _v0, _v1, _v2, _v3, _v4, _v5, _v6, _v7, _v8, _v9, _v10, _v11, _v12, _v13, _v14, _v15) {
        this.length = length;
        this._v0 = _v0;
        this._v1 = _v1;
        this._v2 = _v2;
        this._v3 = _v3;
        this._v4 = _v4;
        this._v5 = _v5;
        this._v6 = _v6;
        this._v7 = _v7;
        this._v8 = _v8;
        this._v9 = _v9;
        this._v10 = _v10;
        this._v11 = _v11;
        this._v12 = _v12;
        this._v13 = _v13;
        this._v14 = _v14;
        this._v15 = _v15;
    }
    InlineArray16.prototype.get = function (index) {
        switch (index) {
            case 0:
                return this._v0;
            case 1:
                return this._v1;
            case 2:
                return this._v2;
            case 3:
                return this._v3;
            case 4:
                return this._v4;
            case 5:
                return this._v5;
            case 6:
                return this._v6;
            case 7:
                return this._v7;
            case 8:
                return this._v8;
            case 9:
                return this._v9;
            case 10:
                return this._v10;
            case 11:
                return this._v11;
            case 12:
                return this._v12;
            case 13:
                return this._v13;
            case 14:
                return this._v14;
            case 15:
                return this._v15;
            default:
                return undefined;
        }
    };
    InlineArray16.prototype.set = function (index, value) {
        switch (index) {
            case 0:
                this._v0 = value;
                break;
            case 1:
                this._v1 = value;
                break;
            case 2:
                this._v2 = value;
                break;
            case 3:
                this._v3 = value;
                break;
            case 4:
                this._v4 = value;
                break;
            case 5:
                this._v5 = value;
                break;
            case 6:
                this._v6 = value;
                break;
            case 7:
                this._v7 = value;
                break;
            case 8:
                this._v8 = value;
                break;
            case 9:
                this._v9 = value;
                break;
            case 10:
                this._v10 = value;
                break;
            case 11:
                this._v11 = value;
                break;
            case 12:
                this._v12 = value;
                break;
            case 13:
                this._v13 = value;
                break;
            case 14:
                this._v14 = value;
                break;
            case 15:
                this._v15 = value;
                break;
        }
    };
    return InlineArray16;
}());
export var InlineArrayDynamic = (function () {
    // Note: We still take the length argument so this class can be created
    // in the same ways as the other classes!
    function InlineArrayDynamic(length) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        this.length = length;
        this._values = values;
    }
    InlineArrayDynamic.prototype.get = function (index) { return this._values[index]; };
    InlineArrayDynamic.prototype.set = function (index, value) { this._values[index] = value; };
    return InlineArrayDynamic;
}());
export var EMPTY_INLINE_ARRAY = new InlineArray0();
//# sourceMappingURL=view_utils.js.map