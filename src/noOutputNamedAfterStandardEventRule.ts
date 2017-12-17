import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'no-output-named-after-standard-event',
    type: 'maintainability',
    description: `Disallows naming directive outputs after a standard DOM event.`,
    rationale: `Listeners subscribed to an output with such a name will also be invoked when the native event is raised.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };

  static FAILURE_STRING: string = 'In the class "%s", the output ' +
  'property "%s" should not be named after a standard event.';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new OutputMetadataWalker(sourceFile,
        this.getOptions()));
  }
}


export class OutputMetadataWalker extends NgWalker {
  private readonly standardEventNames = [
    'abort', 'afterprint', 'animationend', 'animationiteration', 'animationstart', 'appinstalled', 'audioprocess', 'audioend', 'audiostart',
    'beforeprint', 'beforeunload', 'beginEvent', 'blocked', 'blur', 'boundary', 'cached', 'canplay', 'canplaythrough', 'change',
    'chargingchange', 'chargingtimechange', 'checking', 'click', 'close', 'complete', 'compositionend', 'compositionstart',
    'compositionupdate', 'contextmenu', 'copy', 'cut', 'dblclick', 'devicechange', 'devicelight', 'devicemotion', 'deviceorientation',
    'deviceproximity', 'dischargingtimechange', 'DOMAttributeNameChanged', 'DOMAttrModified', 'DOMCharacterDataModified',
    'DOMContentLoaded', 'DOMElementNameChanged', 'focus', 'focusin', 'focusout', 'DOMNodeInserted', 'DOMNodeInsertedIntoDocument',
    'DOMNodeRemoved', 'DOMNodeRemovedFromDocument', 'DOMSubtreeModified', 'downloading', 'drag', 'dragend', 'dragenter', 'dragleave',
    'dragover', 'dragstart', 'drop', 'durationchange', 'emptied', 'end', 'ended', 'endEvent', 'error', 'fullscreenchange',
    'fullscreenerror', 'gamepadconnected', 'gamepaddisconnected', 'gotpointercapture', 'hashchange', 'lostpointercapture', 'input',
    'invalid', 'keydown', 'keypress', 'keyup', 'languagechange', 'levelchange', 'load', 'loadeddata', 'loadedmetadata', 'loadend',
    'loadstart', 'mark', 'message', 'messageerror', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover',
    'mouseup', 'nomatch', 'notificationclick', 'noupdate', 'obsolete', 'offline', 'online', 'open', 'orientationchange', 'pagehide',
    'pageshow', 'paste', 'pause', 'pointercancel', 'pointerdown', 'pointerenter', 'pointerleave', 'pointerlockchange', 'pointerlockerror',
    'pointermove', 'pointerout', 'pointerover', 'pointerup', 'play', 'playing', 'popstate', 'progress', 'push', 'pushsubscriptionchange',
    'ratechange', 'readystatechange', 'repeatEvent', 'reset', 'resize', 'resourcetimingbufferfull', 'result', 'resume', 'scroll', 'seeked',
    'seeking', 'select', 'selectstart', 'selectionchange', 'show', 'soundend', 'soundstart', 'speechend', 'speechstart', 'stalled',
    'start', 'storage', 'submit', 'success', 'suspend', 'SVGAbort', 'SVGError', 'SVGLoad', 'SVGResize', 'SVGScroll', 'SVGUnload',
    'SVGZoom', 'timeout', 'timeupdate', 'touchcancel', 'touchend', 'touchmove', 'touchstart', 'transitionend', 'unload', 'updateready',
    'upgradeneeded', 'userproximity', 'voiceschanged', 'versionchange', 'visibilitychange', 'volumechange', 'waiting', 'wheel'
  ];
  visitNgOutput(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]) {
    let className = (<any>property).parent.name.text;
    let memberName = (<any>property.name).text;

    if (memberName && this.standardEventNames.some(n => n === memberName)) {
      const failureConfig: string[] = [Rule.FAILURE_STRING, className, memberName];
      const errorMessage = sprintf.apply(null, failureConfig);
      this.addFailure(
        this.createFailure(
          property.getStart(),
          property.getWidth(),
          errorMessage
        )
      );
    }
  }
}
