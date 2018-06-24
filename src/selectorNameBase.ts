import * as compiler from '@angular/compiler';
import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { SelectorValidator } from './util/selectorValidator';
import { getDecoratorArgument, getDecoratorName, isStringLiteralLike } from './util/utils';

export type SelectorType = 'element' | 'attribute';
export type SelectorTypeInternal = 'element' | 'attrs';
export type SelectorStyle = 'kebab-case' | 'camelCase';

export abstract class SelectorRule extends Lint.Rules.AbstractRule {
  handleType!: string;
  prefixes: string[];
  types: SelectorTypeInternal[];
  style: SelectorStyle[];

  constructor(options: Lint.IOptions) {
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
    return this.getValidSelectors(selectors).some(
      selector => !this.prefixes.length || this.prefixes.some(p => this.style.some(s => SelectorValidator.prefix(p, s)(selector)))
    );
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new SelectorValidatorWalker(sourceFile, this));
  }

  abstract getTypeFailure(): string;
  abstract getStyleFailure(): string;
  abstract getPrefixFailure(prefixes: string[]): string;

  private getValidSelectors(selectors: compiler.CssSelector[]) {
    return [].concat.apply(
      [],
      selectors.map(selector => {
        return [].concat.apply(
          [],
          this.types
            .map(t => {
              let prop = selector[t];
              if (prop && !(prop instanceof Array)) {
                prop = [prop];
              }
              return prop;
            })
            .filter(Boolean)
        );
      })
    );
  }
}

export class SelectorValidatorWalker extends Lint.RuleWalker {
  constructor(sourceFile: ts.SourceFile, private rule: SelectorRule) {
    super(sourceFile, rule.getOptions());
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    ts.createNodeArray(node.decorators).forEach(this.validateDecorator.bind(this, node.name!.text));
    super.visitClassDeclaration(node);
  }

  private validateDecorator(className: string, decorator: ts.Decorator) {
    const argument = getDecoratorArgument(decorator)!;
    const name = getDecoratorName(decorator);

    // Do not run component rules for directives
    if (this.rule.handleType === name) {
      this.validateSelector(className, argument);
    }
  }

  private validateSelector(className: string, arg: ts.Node) {
    if (!ts.isObjectLiteralExpression(arg)) {
      return;
    }

    arg.properties
      .filter(prop => ts.isPropertyAssignment(prop) && this.validateProperty(prop))
      .map(prop => (ts.isPropertyAssignment(prop) ? prop.initializer : undefined))
      .filter(Boolean)
      .forEach(i => {
        const selectors = this.extractMainSelector(i as ts.StringLiteral);
        let error: string | undefined;

        if (!this.rule.validateType(selectors)) {
          error = sprintf(this.rule.getTypeFailure(), className, this.rule.getOptions().ruleArguments[0]);
        } else if (!this.rule.validateStyle(selectors)) {
          let name = this.rule.getOptions().ruleArguments[2];
          if (name === 'kebab-case') {
            name += ' and include dash';
          }
          error = sprintf(this.rule.getStyleFailure(), className, name);
        } else if (!this.rule.validatePrefix(selectors)) {
          error = sprintf(this.rule.getPrefixFailure(this.rule.prefixes), className, this.rule.prefixes.join(', '));
        }

        if (error) {
          this.addFailureAtNode(i!, error);
        }
      });
  }

  private validateProperty(p: ts.PropertyAssignment): boolean {
    return isStringLiteralLike(p.initializer) && ts.isIdentifier(p.name) && p.name.text === 'selector';
  }

  private extractMainSelector(expression: ts.StringLiteral): compiler.CssSelector[] {
    return compiler.CssSelector.parse(expression.text);
  }
}
