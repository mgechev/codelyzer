import { vsprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { ComponentMetadata, DirectiveMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Ensure that classes use allowed life cycle method in its body.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale:
      'Some life cycle methods can only be used in certain class types.For example, ngOnInit() hook method should not be used in an @Injectable class.',
    ruleName: 'contextual-life-cycle',
    type: 'functionality',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'In the class "%s" which have the "%s" decorator, the "%s" hook method is not allowed. Please, drop it.';

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
  }
}

export class ClassMetadataWalker extends NgWalker {
  className!: string;
  isInjectable = false;
  isComponent = false;
  isDirective = false;
  isPipe = false;

  visitMethodDeclaration(method: ts.MethodDeclaration) {
    const methodName = method.name.getText();

    if (methodName === 'ngOnInit') {
      if (this.isInjectable) {
        this.generateFailure(method, this.className, '@Injectable', 'ngOnInit()');
      } else if (this.isPipe) {
        this.generateFailure(method, this.className, '@Pipe', 'ngOnInit()');
      }
    }

    if (methodName === 'ngOnChanges') {
      if (this.isInjectable) {
        this.generateFailure(method, this.className, '@Injectable', 'ngOnChanges()');
      } else if (this.isPipe) {
        this.generateFailure(method, this.className, '@Pipe', 'ngOnChanges()');
      }
    }

    if (methodName === 'ngDoCheck') {
      if (this.isInjectable) {
        this.generateFailure(method, this.className, '@Injectable', 'ngDoCheck()');
      } else if (this.isPipe) {
        this.generateFailure(method, this.className, '@Pipe', 'ngDoCheck()');
      }
    }

    if (methodName === 'ngAfterContentInit') {
      if (this.isInjectable) {
        this.generateFailure(method, this.className, '@Injectable', 'ngAfterContentInit()');
      } else if (this.isPipe) {
        this.generateFailure(method, this.className, '@Pipe', 'ngAfterContentInit()');
      }
    }

    if (methodName === 'ngAfterContentChecked') {
      if (this.isInjectable) {
        this.generateFailure(method, this.className, '@Injectable', 'ngAfterContentChecked()');
      } else if (this.isPipe) {
        this.generateFailure(method, this.className, '@Pipe', 'ngAfterContentChecked()');
      }
    }

    if (methodName === 'ngAfterViewInit') {
      if (this.isInjectable) {
        this.generateFailure(method, this.className, '@Injectable', 'ngAfterViewInit()');
      } else if (this.isPipe) {
        this.generateFailure(method, this.className, '@Pipe', 'ngAfterViewInit()');
      }
    }

    if (methodName === 'ngAfterViewChecked') {
      if (this.isInjectable) {
        this.generateFailure(method, this.className, '@Injectable', 'ngAfterViewChecked()');
      } else if (this.isPipe) {
        this.generateFailure(method, this.className, '@Pipe', 'ngAfterViewChecked()');
      }
    }

    super.visitMethodDeclaration(method);
  }

  protected visitNgInjectable(controller: ts.ClassDeclaration, decorator: ts.Decorator) {
    this.className = controller.name!.text;
    this.isInjectable = true;
    this.isComponent = false;
    this.isDirective = false;
    this.isPipe = false;
    super.visitNgInjectable(controller, decorator);
  }

  protected visitNgComponent(metadata: ComponentMetadata) {
    this.className = metadata.controller.name!.text;
    this.isComponent = true;
    this.isInjectable = false;
    this.isDirective = false;
    this.isPipe = false;
    super.visitNgComponent(metadata);
  }

  protected visitNgDirective(metadata: DirectiveMetadata) {
    this.className = metadata.controller.name!.text;
    this.isDirective = true;
    this.isInjectable = false;
    this.isComponent = false;
    this.isPipe = false;
    super.visitNgDirective(metadata);
  }

  protected visitNgPipe(controller: ts.ClassDeclaration, decorator: ts.Decorator) {
    this.className = controller.name!.text;
    this.isPipe = true;
    this.isInjectable = false;
    this.isComponent = false;
    this.isDirective = false;
    super.visitNgPipe(controller, decorator);
  }

  private generateFailure(method: ts.MethodDeclaration, ...failureConfig: string[]) {
    this.addFailureAtNode(method, vsprintf(Rule.FAILURE_STRING, failureConfig));
  }
}
