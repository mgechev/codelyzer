import { vsprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { ComponentMetadata, DirectiveMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  static metadata: Lint.IRuleMetadata = {
    description: 'Ensure that classes use allowed life cycle method in its body.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: `Some life cycle methods can only be used in certain class types.
    For example, ngOnInit() hook method should not be used in an @Injectable class.`,
    ruleName: 'contextual-life-cycle',
    type: 'functionality',
    typescriptOnly: true
  };

  static FAILURE_STRING = 'In the class "%s" which have the "%s" decorator, the ' +
  '"%s" hook method is not allowed. ' +
  'Please, drop it.';

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this));
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
    this.isComponent = false;
    this.isDirective = false;
    this.isPipe = false;
  }

  visitNgComponent(metadata: ComponentMetadata) {
    this.className = metadata.controller.name.text;
    this.isComponent = true;
    this.isInjectable = false;
    this.isDirective = false;
    this.isPipe = false;
  }

  visitNgDirective(metadata: DirectiveMetadata) {
    this.className = metadata.controller.name.text;
    this.isDirective = true;
    this.isInjectable = false;
    this.isComponent = false;
    this.isPipe = false;
  }

  visitNgPipe(controller: ts.ClassDeclaration, decorator: ts.Decorator) {
    this.className = controller.name.text;
    this.isPipe = true;
    this.isInjectable = false;
    this.isComponent = false;
    this.isDirective = false;
  }

  visitMethodDeclaration(method: ts.MethodDeclaration) {
    const methodName = (method.name as ts.StringLiteral).text;

    if (methodName === 'ngOnInit') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngOnInit()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngOnInit()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }

    if (methodName === 'ngOnChanges') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngOnChanges()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngOnChanges()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }

    if (methodName === 'ngDoCheck') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngDoCheck()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngDoCheck()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }

    if (methodName === 'ngAfterContentInit') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngAfterContentInit()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngAfterContentInit()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }

    if (methodName === 'ngAfterContentChecked') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngAfterContentChecked()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngAfterContentChecked()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }

    if (methodName === 'ngAfterViewInit') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngAfterViewInit()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngAfterViewInit()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }

    if (methodName === 'ngAfterViewChecked') {
      if (this.isInjectable) {
        let failureConfig: string[] = [this.className, '@Injectable', 'ngAfterViewChecked()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      } else if (this.isPipe) {
        let failureConfig: string[] = [this.className, '@Pipe', 'ngAfterViewChecked()'];
        this.generateFailure(method.getStart(), method.getWidth(), failureConfig);
      }
    }
  }

  private generateFailure(start: number, width: number, failureConfig: string[]) {
    this.addFailure(this.createFailure(start, width, vsprintf(Rule.FAILURE_STRING, failureConfig)));
  }
}
