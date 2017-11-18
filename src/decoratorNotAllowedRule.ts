import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import SyntaxKind = require('./util/syntaxKind');
import { NgWalker } from './angular/ngWalker';
import { ComponentMetadata, DirectiveMetadata } from './angular/metadata';


export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'decorator-not-allowed',
    type: 'functionality',
    description: `Ensure that classes use allowed decorator in its body`,
    rationale: `Some decorators can only be used in certain class types.
    For example, an @Input should not be used in an @Injectable class.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };


  static INJECTABLE_FAILURE_STRING: string = 'In the class "%s" which have the "%s" decorator, the ' +
    '"%s" decorator is not allowed. ' +
    'Please, drop it.';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new ClassMetadataWalker(sourceFile,
        this));
  }
}


export class ClassMetadataWalker extends NgWalker {

  className: string;
  isInjectable = false;

  constructor(sourceFile: ts.SourceFile, private rule: Rule) {
    super(sourceFile, rule.getOptions());
  }

  visitNgInjectable(classDeclaration: ts.ClassDeclaration, decorator: ts.Decorator) {
    this.className = classDeclaration.name.text;
    this.isInjectable = true;
    super.visitNgInjectable(classDeclaration, decorator);
  }

  protected visitNgDirective(metadata: DirectiveMetadata) {
    this.isInjectable = false;
    super.visitNgDirective(metadata);
  }

  protected visitNgPipe(controller: ts.ClassDeclaration, decorator: ts.Decorator) {
    this.isInjectable = false;
    super.visitNgPipe(controller, decorator);
  }

  protected visitNgComponent(metadata: ComponentMetadata) {
    this.isInjectable = false;
    super.visitNgComponent(metadata);
  }

  protected visitNgInput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      let failureConfig: string[] = [this.className, '@Injectable', '@Input'];
      failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
      this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
    }
  }

  protected visitNgOutput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      let failureConfig: string[] = [this.className, '@Injectable', '@Output'];
      failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
      this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
    }
  }

  protected visitNgHostBinding(property: ts.PropertyDeclaration, decorator: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      let failureConfig: string[] = [this.className, '@Injectable', '@HostBinding'];
      failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
      this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
    }
  }

  protected visitNgHostListener(method: ts.MethodDeclaration, decorator: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      let failureConfig: string[] = [this.className, '@Injectable', '@HostListener'];
      failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
      this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
    }
  }

  protected visitNgContentChild(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      let failureConfig: string[] = [this.className, '@Injectable', '@ContentChild'];
      failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
      this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
    }
  }

  protected visitNgContentChildren(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      let failureConfig: string[] = [this.className, '@Injectable', '@ContentChildren'];
      failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
      this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
    }
  }

  protected visitNgViewChild(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      let failureConfig: string[] = [this.className, '@Injectable', '@ViewChild'];
      failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
      this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
    }
  }

  protected visitNgViewChildren(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      let failureConfig: string[] = [this.className, '@Injectable', '@ViewChildren'];
      failureConfig.unshift(Rule.INJECTABLE_FAILURE_STRING);
      this.generateFailure(property.getStart(), property.getWidth(), failureConfig);
    }
  }

  private generateFailure(start: number, width: number, failureConfig: string[]) {
    this.addFailure(
      this.createFailure(
        start,
        width,
        sprintf.apply(this, failureConfig)));
  }

}
