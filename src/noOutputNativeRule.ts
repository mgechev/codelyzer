import { sprintf } from 'sprintf-js';
import { IRuleMetadata, RuleFailure } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { Decorator, PropertyDeclaration, SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { getClassName } from './util/utils';

interface FailureParameters {
  readonly className: string;
  readonly propertyName: string;
}

// source: https://developer.mozilla.org/en-US/docs/Web/Events
const nativeEventNames: ReadonlySet<string> = new Set([
  'abort',
  'afterprint',
  'animationend',
  'animationiteration',
  'animationstart',
  'appinstalled',
  'audioprocess',
  'audioend',
  'audiostart',
  'beforeprint',
  'beforeunload',
  'beginEvent',
  'blocked',
  'blur',
  'boundary',
  'cached',
  'canplay',
  'canplaythrough',
  'change',
  'chargingchange',
  'chargingtimechange',
  'checking',
  'click',
  'close',
  'complete',
  'compositionend',
  'compositionstart',
  'compositionupdate',
  'contextmenu',
  'copy',
  'cut',
  'dblclick',
  'devicechange',
  'devicelight',
  'devicemotion',
  'deviceorientation',
  'deviceproximity',
  'dischargingtimechange',
  'DOMAttributeNameChanged',
  'DOMAttrModified',
  'DOMCharacterDataModified',
  'DOMContentLoaded',
  'DOMElementNameChanged',
  'focus',
  'focusin',
  'focusout',
  'DOMNodeInserted',
  'DOMNodeInsertedIntoDocument',
  'DOMNodeRemoved',
  'DOMNodeRemovedFromDocument',
  'DOMSubtreeModified',
  'downloading',
  'drag',
  'dragend',
  'dragenter',
  'dragleave',
  'dragover',
  'dragstart',
  'drop',
  'durationchange',
  'emptied',
  'end',
  'ended',
  'endEvent',
  'error',
  'fullscreenchange',
  'fullscreenerror',
  'gamepadconnected',
  'gamepaddisconnected',
  'gotpointercapture',
  'hashchange',
  'lostpointercapture',
  'input',
  'invalid',
  'keydown',
  'keypress',
  'keyup',
  'languagechange',
  'levelchange',
  'load',
  'loadeddata',
  'loadedmetadata',
  'loadend',
  'loadstart',
  'mark',
  'message',
  'messageerror',
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'nomatch',
  'notificationclick',
  'noupdate',
  'obsolete',
  'offline',
  'online',
  'open',
  'orientationchange',
  'pagehide',
  'pageshow',
  'paste',
  'pause',
  'pointercancel',
  'pointerdown',
  'pointerenter',
  'pointerleave',
  'pointerlockchange',
  'pointerlockerror',
  'pointermove',
  'pointerout',
  'pointerover',
  'pointerup',
  'play',
  'playing',
  'popstate',
  'progress',
  'push',
  'pushsubscriptionchange',
  'ratechange',
  'readystatechange',
  'repeatEvent',
  'reset',
  'resize',
  'resourcetimingbufferfull',
  'result',
  'resume',
  'scroll',
  'seeked',
  'seeking',
  'select',
  'selectstart',
  'selectionchange',
  'show',
  'soundend',
  'soundstart',
  'speechend',
  'speechstart',
  'stalled',
  'start',
  'storage',
  'submit',
  'success',
  'suspend',
  'SVGAbort',
  'SVGError',
  'SVGLoad',
  'SVGResize',
  'SVGScroll',
  'SVGUnload',
  'SVGZoom',
  'timeout',
  'timeupdate',
  'touchcancel',
  'touchend',
  'touchmove',
  'touchstart',
  'transitionend',
  'unload',
  'updateready',
  'upgradeneeded',
  'userproximity',
  'voiceschanged',
  'versionchange',
  'visibilitychange',
  'volumechange',
  'waiting',
  'wheel',
]);

export const getFailureMessage = (failureParameters: FailureParameters): string =>
  sprintf(Rule.FAILURE_STRING, failureParameters.className, failureParameters.propertyName);

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Disallows naming directive outputs as standard DOM event.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: 'Listeners subscribed to an output with such a name will also be invoked when the native event is raised.',
    ruleName: 'no-output-native',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'In the class "%s", the output property "%s" should not be named or renamed as a native event';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walker = new Walker(sourceFile, this.getOptions());

    return this.applyWithWalker(walker);
  }
}

class Walker extends NgWalker {
  protected visitNgOutput(property: PropertyDeclaration, output: Decorator, args: string[]): void {
    this.validateOutput(property, args);
    super.visitNgOutput(property, output, args);
  }

  private validateOutput(property: PropertyDeclaration, args: string[]): void {
    const className = getClassName(property);

    if (!className) return;

    const propertyName = property.name.getText();
    const outputName = args[0] || propertyName;

    if (!outputName || !nativeEventNames.has(outputName)) return;

    const failure = getFailureMessage({ className, propertyName });

    this.addFailureAtNode(property, failure);
  }
}
