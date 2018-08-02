import { vsprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { ComponentMetadata, DirectiveMetadata } from './angular/metadata';
import { NgWalker } from './angular/ngWalker';

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Ensure that classes use allowed decorator in its body.',
    options: null,
    optionsDescription: 'Not configurable.',
    rationale:
      'Some decorators can only be used in certain class types. For example, an @Input should not be used in an @Injectable class.',
    ruleName: 'decorator-not-allowed',
    type: 'functionality',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'In the class "%s" which have the "%s" decorator, the "%s" decorator is not allowed. Please, drop it.';

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this.getOptions()));
  }
}

export class ClassMetadataWalker extends NgWalker {
  className!: string;
  isInjectable = false;

  protected visitNgInjectable(classDeclaration: ts.ClassDeclaration, decorator: ts.Decorator) {
    this.className = classDeclaration.name!.text;
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
      this.generateFailure(property, this.className, '@Injectable', '@Input');
    }
    super.visitNgInput(property, input, args);
  }

  protected visitNgOutput(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      this.generateFailure(property, this.className, '@Injectable', '@Output');
    }
    super.visitNgInput(property, input, args);
  }

  protected visitNgHostBinding(property: ts.PropertyDeclaration, decorator: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      this.generateFailure(property, this.className, '@Injectable', '@HostBinding');
    }
    super.visitNgHostBinding(property, decorator, args);
  }

  protected visitNgHostListener(method: ts.MethodDeclaration, decorator: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      this.generateFailure(method, this.className, '@Injectable', '@HostListener');
    }
    super.visitNgHostListener(method, decorator, args);
  }

  protected visitNgContentChild(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      this.generateFailure(property, this.className, '@Injectable', '@ContentChild');
    }
    super.visitNgContentChild(property, input, args);
  }

  protected visitNgContentChildren(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      this.generateFailure(property, this.className, '@Injectable', '@ContentChildren');
    }
    super.visitNgContentChildren(property, input, args);
  }

  protected visitNgViewChild(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      this.generateFailure(property, this.className, '@Injectable', '@ViewChild');
    }
    super.visitNgViewChild(property, input, args);
  }

  protected visitNgViewChildren(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]) {
    if (this.isInjectable) {
      this.generateFailure(property, this.className, '@Injectable', '@ViewChildren');
    }
    super.visitNgViewChildren(property, input, args);
  }

  private generateFailure(property: ts.Node, ...failureConfig: string[]) {
    this.addFailureAtNode(property, vsprintf(Rule.FAILURE_STRING, failureConfig));
  }
}
