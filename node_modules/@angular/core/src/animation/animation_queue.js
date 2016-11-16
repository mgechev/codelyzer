/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var _queuedAnimations = [];
/** @internal */
export function queueAnimation(player) {
    _queuedAnimations.push(player);
}
/** @internal */
export function triggerQueuedAnimations() {
    // this code is wrapped into a single promise such that the
    // onStart and onDone player callbacks are triggered outside
    // of the digest cycle of animations
    if (_queuedAnimations.length) {
        Promise.resolve(null).then(_triggerAnimations);
    }
}
function _triggerAnimations() {
    for (var i = 0; i < _queuedAnimations.length; i++) {
        var player = _queuedAnimations[i];
        player.play();
    }
    _queuedAnimations = [];
}
//# sourceMappingURL=animation_queue.js.map