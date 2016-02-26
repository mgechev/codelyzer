import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';
import {sprintf} from 'sprintf-js';

export enum COMPONENT_TYPE {
  COMPONENT,
  DIRECTIVE,
  ANY
};

export abstract class SelectorRule extends Lint.Rules.AbstractRule {
  constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[],
    private validator: Function, private failureString: string, private target: COMPONENT_TYPE = COMPONENT_TYPE.ANY) {
    super(ruleName, value, disabledIntervals);
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    let documentRegistry = ts.createDocumentRegistry();
    let languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
    let languageService : ts.LanguageService = ts.createLanguageService(languageServiceHost, documentRegistry);
    return this.applyWithWalker(
      new SelectorNameValidatorWalker(
        sourceFile,
        languageService,
        this));
  }

  public getFailureString(failureConfig): string {
    return sprintf(this.failureString, failureConfig.className, this.getOptions().ruleArguments[0], failureConfig.selector);
  }

  public validate(selector: string): boolean {
    return this.validator(selector);
  }

  public get targetType(): COMPONENT_TYPE {
    return this.target;
  }
}

class SelectorNameValidatorWalker extends Lint.RuleWalker {
  private languageService : ts.LanguageService;
  private typeChecker : ts.TypeChecker;

  constructor(sourceFile: ts.SourceFile, languageService : ts.LanguageService, private rule: SelectorRule) {
    super(sourceFile, rule.getOptions());
    this.languageService = languageService;
    this.typeChecker = languageService.getProgram().getTypeChecker();
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    (node.decorators || []).forEach(this.validateDecorator.bind(this, node.name.text));
    super.visitClassDeclaration(node);
  }

  private validateDecorator(className: string, decorator: ts.Decorator) {
    let baseExpr = <any>decorator.expression || {};
    let expr = baseExpr.expression || {};
    let name = expr.text;
    let args = baseExpr.arguments || [];
    let arg = args[0];
    if (this.rule.targetType === COMPONENT_TYPE.ANY ||
        name === 'Component' && this.rule.targetType === COMPONENT_TYPE.COMPONENT ||
        name === 'Directive' && this.rule.targetType === COMPONENT_TYPE.DIRECTIVE) {
      this.validateSelector(className, arg);
    }
  }

  private validateSelector(className: string, arg: ts.Node) {
    if (arg.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      (<ts.ObjectLiteralExpression>arg).properties.filter(prop => (<any>prop.name).text === 'selector')
      .forEach(prop => {
        let p = <any>prop;
        if (p.initializer.kind === ts.SyntaxKind.StringLiteral && !this.rule.validate(p.initializer.text)) {
          let error = this.rule.getFailureString({ selector: p.initializer.text, className });
          this.addFailure(this.createFailure(p.initializer.getStart(), p.initializer.getWidth(), error));
        }
      });
    }
  }
}
