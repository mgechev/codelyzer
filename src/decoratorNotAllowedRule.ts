import * as Lint from 'tslint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import SyntaxKind = require('./util/syntaxKind');
import {NgWalker} from './angular/ngWalker';


export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'decorator-not-allowed',
    type: 'maintainability',
    description: `Ensure that classes implementing PipeTransform interface, use Pipe decorator`,
    rationale: `Interfaces prescribe typed method signatures. Use those signatures to flag spelling and syntax mistakes.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };


  static FAILURE_STRING: string = 'In the class "%s" which have the "%s" decorator, the ' +
    '"%s" decorator not allowed. ' +
    'Please, drop it.';


  static PIPE_INTERFACE_NAME = 'PipeTransform';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {


    return this.applyWithWalker(
      new ClassMetadataWalker(sourceFile,
        this));
  }
}



export class ClassMetadataWalker extends NgWalker {

  className:string;
  isInjectable = false;

  constructor(sourceFile: ts.SourceFile, private rule: Rule) {

    super(sourceFile, rule.getOptions());
    console.log('cons');
  }

  visitNgInjectable(controller: ts.ClassDeclaration, decorator: ts.Decorator) {

    this.className = controller.name.text;

    console.log('visitNgInjectable');
    this.isInjectable=true;

  }

  protected visitNgInput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if(this.isInjectable) {
      console.log('INPUT !!!');
      let failureConfig: string[] = [this.className, '@Injectable', '@Input'];
      failureConfig.unshift(Rule.FAILURE_STRING);
      this.addFailure(
        this.createFailure(
          property.getStart(),
          property.getWidth(),
          sprintf.apply(this, failureConfig)));
    }

  }

  protected visitNgOutput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if(this.isInjectable) {
      console.log('Ouptut !!!');
      let failureConfig: string[] = [this.className, '@Injectable', '@Output'];
      failureConfig.unshift(Rule.FAILURE_STRING);
      this.addFailure(
        this.createFailure(
          property.getStart(),
          property.getWidth(),
          sprintf.apply(this, failureConfig)));
    }

  }


  protected visitNgHostBinding(property: ts.PropertyDeclaration, decorator: ts.Decorator, args: string[]) {
    if(this.isInjectable) {
      let failureConfig: string[] = [this.className, '@Injectable', '@HostBinding'];
      failureConfig.unshift(Rule.FAILURE_STRING);
      this.addFailure(
        this.createFailure(
          property.getStart(),
          property.getWidth(),
          sprintf.apply(this, failureConfig)));
    }
  }

  protected visitNgHostListener(method: ts.MethodDeclaration, decorator: ts.Decorator, args: string[]) {
    if(this.isInjectable) {
      let failureConfig: string[] = [this.className, '@Injectable', '@HostListener'];
      failureConfig.unshift(Rule.FAILURE_STRING);
      this.addFailure(
        this.createFailure(
          method.getStart(),
          method.getWidth(),
          sprintf.apply(this, failureConfig)));
    }
  }

  protected visitNgContentChild(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) { // @ContentChild(ChildDirective) contentChild: ChildDirective;

  }

  protected visitNgContentChildren(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) { // @ContentChildren(Pane) topLevelPanes: QueryList<Pane>;

  }

  protected visitNgViewChild(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) { // @ViewChild(ChildDirective) child: ChildDirective;

  }

  protected visitNgViewChildren(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) { // @ViewChildren(ChildDirective) viewChildren: QueryList<ChildDirective>;


  }

}



