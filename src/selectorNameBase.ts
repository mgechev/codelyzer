import * as Lint from 'tslint';
import { SelectorValidator } from './util/selectorValidator';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import * as compiler from '@angular/compiler';
import { IOptions } from 'tslint';
import SyntaxKind = require('./util/syntaxKind');

export type SelectorType = 'element' | 'attribute';
export type SelectorTypeInternal = 'element' | 'attrs';
export type SelectorStyle = 'kebab-case' | 'camelCase';

export abstract class SelectorRule extends Lint.Rules.AbstractRule {
  handleType: string;
  prefixes: string[];
  types: SelectorTypeInternal[];
  style: SelectorStyle[];

  constructor(options: IOptions) {
    super(options);
    const args = this.getOptions().ruleArguments;

    let type: SelectorType[] = args[0] || ['element', 'attribute'];
    if (!(type instanceof Array)) {
      type = [type];
    }
    let internal: SelectorTypeInternal[] = [];
    if (type.indexOf('element') >= 0) {
      internal.push('element');
    }
    if (type.indexOf('attribute') >= 0) {
      internal.push('attrs');
    }
    this.types = internal;

    let prefix = args[1] || [];
    if (!(prefix instanceof Array)) {
      prefix = [prefix];
    }
    this.prefixes = prefix;

    let style = args[2];
    if (!(style instanceof Array)) {
      style = [style];
    }
    this.style = style;
  }

  public validateType(selectors: compiler.CssSelector[]): boolean {
    return this.getValidSelectors(selectors).length > 0;
  }

  public validateStyle(selectors: compiler.CssSelector[]): boolean {
    return this.getValidSelectors(selectors).some(selector => {
      return this.style.some(style => {
        let validator = SelectorValidator.camelCase;
        if (style === 'kebab-case') {
          validator = SelectorValidator.kebabCase;
        }
        return validator(selector);
      });
    });
  }

  public validatePrefix(selectors: compiler.CssSelector[]): boolean {
    return this.getValidSelectors(selectors)
      .some(selector => !this.prefixes.length || this.prefixes.some(p =>
        this.style.some(s => SelectorValidator.prefix(p, s)(selector))));
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new SelectorValidatorWalker(sourceFile, this));
  }

  abstract getTypeFailure(): string;
  abstract getStyleFailure(): string;
  abstract getPrefixFailure(prefixes: string[]): string;

  private getValidSelectors(selectors: compiler.CssSelector[]) {
    return [].concat.apply([], selectors.map(selector => {
      return [].concat.apply([], this.types.map(t => {
        let prop = selector[t];
        if (prop && !(prop instanceof Array)) {
          prop = [prop];
        }
        return prop;
      }).filter(s => !!s));
    }));
  }
}

export class SelectorValidatorWalker extends Lint.RuleWalker {

  constructor(sourceFile: ts.SourceFile, private rule: SelectorRule) {
    super(sourceFile, rule.getOptions());
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    (<ts.Decorator[]>node.decorators || [])
      .forEach(this.validateDecorator.bind(this, node.name.text));
    super.visitClassDeclaration(node);
  }

  private validateDecorator(className: string, decorator: ts.Decorator) {
    let baseExpr = <any>decorator.expression || {};
    let expr = baseExpr.expression || {};
    let name = expr.text;
    let args = baseExpr.arguments || [];
    let arg = args[0];
    // Do not run component rules for directives
    if (this.rule.handleType === name) {
      this.validateSelector(className, arg);
    }
  }

  private validateSelector(className: string, arg: ts.Node) {
    if (arg.kind === SyntaxKind.current().ObjectLiteralExpression) {
      (<ts.ObjectLiteralExpression>arg).properties.filter(prop => this.validateProperty(prop))
        .map(prop => (<any>prop).initializer)
        .forEach(i => {
          const selectors: compiler.CssSelector[] = this.extractMainSelector(i);
          if (!this.rule.validateType(selectors)) {
            let error = sprintf(this.rule.getTypeFailure(), className, this.rule.getOptions().ruleArguments[0]);
            this.addFailure(this.createFailure(i.getStart(), i.getWidth(), error));
          } else if (!this.rule.validateStyle(selectors)) {
            let name = this.rule.getOptions().ruleArguments[2];
            if (name === 'kebab-case') {
              name += ' and include dash';
            }
            let error = sprintf(this.rule.getStyleFailure(), className, name);
            this.addFailure(this.createFailure(i.getStart(), i.getWidth(), error));
          } else if (!this.rule.validatePrefix(selectors)) {
            let error = sprintf(this.rule.getPrefixFailure(this.rule.prefixes), className, this.rule.prefixes.join(', '));
            this.addFailure(this.createFailure(i.getStart(), i.getWidth(), error));
          }
        });
    }
  }

  private validateProperty(p: any) {
    return (<any>p.name).text === 'selector' && p.initializer && this.isSupportedKind(p.initializer.kind);
  }

  private isSupportedKind(kind: number): boolean {
    const current = SyntaxKind.current();
    return [current.StringLiteral, current.NoSubstitutionTemplateLiteral].some(kindType => kindType === kind);
  }

  private extractMainSelector(i: any) {
    return compiler.CssSelector.parse(i.text);
  }
}

