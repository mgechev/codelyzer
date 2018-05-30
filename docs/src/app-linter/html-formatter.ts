import { Formatter } from './formatter-interface';

export class HtmlFormatter implements Formatter {
  format(e: any) {
    return (
      `<li id="${e.id}"><i class="warning-icon"></i><span class="position">` +
      `[${e.startPosition.line + 1} - ${e.endPosition.line + 1}]</span> ${this.linkify(e.failure)}` +
      ` <span class="rule-name">(${e.ruleName})</span></li>`
    );
  }

  formatErrors(errors: any) {
    return errors.map((e: any) => this.format(e)).join('');
  }

  private linkify(inputText: string) {
    let replacedText: string, replacePattern1: RegExp, replacePattern2: RegExp;

    // URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    return replacedText;
  }
}
