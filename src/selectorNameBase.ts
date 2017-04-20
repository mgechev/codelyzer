import * as Lint from 'tslint';
import {SelectorValidator} from './util/selectorValidator';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import * as compiler from '@angular/compiler';
import { IOptions } from 'tslint';
import SyntaxKind = require('./util/syntaxKind');

export abstract class SelectorRule extends Lint.Rules.AbstractRule {

  public isMultiPrefix:boolean;
  public prefixArguments:string;
  public cssSelectorProperty:string;

  public handleType: string;

  private typeValidator:Function;
  private prefixValidator:Function;
  private nameValidator:Function;
  private FAILURE_PREFIX;
  private isMultiSelectors:boolean;

  constructor(options: IOptions) {
    const args = options.ruleArguments;
    let type = args[1];
    let prefix = args[2] || [];
    let name = args[3];
    super(options);
    this.setMultiPrefix(prefix);
    this.setPrefixArguments(prefix);
    this.setPrefixValidator(prefix, name);
    this.setPrefixFailure();
    this.setTypeValidator(type);
    this.setNameValidator(name);
  }

  public getPrefixFailure():string {
    return this.FAILURE_PREFIX;
  }

  public validateType(selector:string):boolean {
    return this.typeValidator(selector);
  }

  public validateName(selector:any):boolean {
    if(this.isMultiSelectors) {
      return selector.some((a) => this.nameValidator(a));
    } else {
      return this.nameValidator(selector);
    }
  }

  public validatePrefix(selector:any):boolean {
    if(this.isMultiSelectors) {
      return selector.some((a) => this.prefixValidator(a));
    } else {
      return this.prefixValidator(selector);
    }
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new SelectorValidatorWalker(
        sourceFile,
        this));
  }

  public abstract getTypeFailure(): any;
  public abstract  getNameFailure(): any;
  protected abstract getSinglePrefixFailure(): any;
  protected abstract getManyPrefixFailure(): any;

  private setNameValidator(name:string) {
    if (name === 'camelCase') {
      this.nameValidator = SelectorValidator.camelCase;
    } else if(name === 'kebab-case') {
      this.nameValidator = SelectorValidator.kebabCase;
    }
  }

  private setMultiPrefix(prefix:string) {
    this.isMultiPrefix = typeof prefix ==='string';
  }

  private setPrefixArguments(prefix:any) {
    this.prefixArguments = this.isMultiPrefix?prefix:prefix.join(',');
  }

  private setPrefixValidator(prefix: any, name: string) {
    if (!this.isMultiPrefix) {
      prefix = (prefix||[]).sort((a: string, b: string) => {
        return a.length < b.length ? 1 : -1;
      });
    }
    let prefixExpression: string = this.isMultiPrefix?prefix:(prefix||[]).join('|');
    this.prefixValidator = SelectorValidator.prefix(prefixExpression, name);
  }

  private setPrefixFailure() {
    this.FAILURE_PREFIX = this.isMultiPrefix?this.getSinglePrefixFailure():this.getManyPrefixFailure();
  }

  private setTypeValidator(type:string) {
    if (type === 'element') {
      this.typeValidator = SelectorValidator.element;
      this.isMultiSelectors = false;
      this.cssSelectorProperty = 'element';
    } else if (type === 'attribute') {
      this.typeValidator = SelectorValidator.attribute;
      this.isMultiSelectors = true;
      this.cssSelectorProperty = 'attrs';
    }
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
        .map(prop=>(<any>prop).initializer)
        .forEach(i => {
          const selectors: any = this.extractMainSelector(i);
          const validateSelectors = (cb: any) => {
            // If all selectors fail, this will return true which means that the selector is invalid
            // according to the validation callback.
            // Since the method is called validateSelector, it's suppose to return true if the
            // selector is valid, so we're taking the result with "!".
            return !selectors.every((selector: any) => {
              return !cb(selector[this.rule.cssSelectorProperty]);
            });
          };
          if (!validateSelectors(this.rule.validateType.bind(this.rule))) {
            let error = sprintf(this.rule.getTypeFailure(), className, this.rule.getOptions().ruleArguments[1]);
            this.addFailure(this.createFailure(i.getStart(), i.getWidth(),error));
          } else if (!validateSelectors(this.rule.validateName.bind(this.rule))) {
            let name = this.rule.getOptions().ruleArguments[3];
            if (name === 'kebab-case') {
              name += ' and include dash';
            }
            let error = sprintf(this.rule.getNameFailure(), className, name);
            this.addFailure(this.createFailure(i.getStart(), i.getWidth(), error));
          } else if (!validateSelectors(this.rule.validatePrefix.bind(this.rule))) {
            let error = sprintf(this.rule.getPrefixFailure(),className,this.rule.prefixArguments);
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

  private extractMainSelector(i:any) {
    return compiler.CssSelector.parse(i.text);
  }
}

