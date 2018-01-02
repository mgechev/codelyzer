import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import SyntaxKind = require('./util/syntaxKind');
import { NgWalker } from './angular/ngWalker';
import { ComponentMetadata, DirectiveMetadata } from './angular/metadata';


export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'contextual-life-cycle',
    type: 'functionality',
    description: 'Ensure that classes use allowed life cycle method in its body',
    rationale: `Some life cycle methods can only be used in certain class types.
    For example, ngOnInit() hook method should not be used in an @Injectable class.`,
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true,
  };


  static FAILURE_STRING: string = 'In the class "%s" which have the "%s" decorator, the ' +
    '"%s" hook method is not allowed. ' +
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
  isComponent = false;
  isDirective = false;
  isPipe = false;

  constructor(sourceFile: ts.SourceFile, private rule: Rule) {
    super(sourceFile, rule.getOptions());
  }

  visitNgInjectable(controller: ts.ClassDeclaration, decorator: ts.Decorator) {
    this.className = controller.name.text;
    this.isInjectable = true;
  }

  visitNgComponent(metadata: ComponentMetadata) {
    this.className = metadata.controller.name.text;
    this.isComponent = true;
  }

  visitNgDirective(metadata: DirectiveMetadata) {
    this.className = metadata.controller.name.text;
    this.isDirective = true;
  }

  visitNgPipe(controller: ts.ClassDeclaration, decorator: ts.Decorator) {
    this.className = controller.name.text;
    this.isPipe = true;
  }

  visitMethodDeclaration(method: ts.MethodDeclaration) {

    const methodName = (method.name as ts.StringLiteral).text;

    if (methodName === 'ngOnInit') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngOnInit()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngOnInit()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }

    if (methodName === 'ngOnChanges') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngOnChanges()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngOnChanges()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }

    if (methodName === 'ngDoCheck') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngDoCheck()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngDoCheck()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }

    if (methodName === 'ngAfterContentInit') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngAfterContentInit()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngAfterContentInit()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }

    if (methodName === 'ngAfterContentChecked') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngAfterContentChecked()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngAfterContentChecked()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }

    if (methodName === 'ngAfterViewInit') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngAfterViewInit()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngAfterViewInit()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }

    if (methodName === 'ngAfterViewChecked') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngAfterViewChecked()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngAfterViewChecked()'];
        failureConfig.unshift(Rule.FAILURE_STRING);
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
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
