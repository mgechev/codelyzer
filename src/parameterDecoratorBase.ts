import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';

export interface IUseParameterDecoratorConfig {
  propertyName: string;
  decoratorName: string | string[];
  errorMessage: string;
}

export class UseParameterDecorator extends Lint.Rules.AbstractRule {
  private static FAILURE_STRING = 'In the "@%s" class decorator of the class "%s"' +
  ' you are using the "%s" property, this is considered bad practice. Use %s property decorator instead.';

  public static formatFailureString(config: IUseParameterDecoratorConfig, decoratorName: string, className: string) {
    let decorators = config.decoratorName;
    if (decorators instanceof Array) {
      decorators = (<string[]>decorators).map(d => `"@${d}"`).join(', ');
    } else {
      decorators = `"@${decorators}"`;
    }
    return sprintf(config.errorMessage, decoratorName, className, config.propertyName, decorators);
  }

  constructor(private config: IUseParameterDecoratorConfig, ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[]) {
    super(ruleName, value, disabledIntervals);
    config.errorMessage = config.errorMessage || UseParameterDecorator.FAILURE_STRING;
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    let documentRegistry = ts.createDocumentRegistry();
    let languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
    return this.applyWithWalker(
      new DirectiveMetadataWalker(sourceFile,
        this.getOptions(),
        ts.createLanguageService(languageServiceHost, documentRegistry), this.config));
  }
}

class DirectiveMetadataWalker extends Lint.RuleWalker {
  private languageService : ts.LanguageService;
  private typeChecker : ts.TypeChecker;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions,
    languageService : ts.LanguageService, private config: IUseParameterDecoratorConfig) {
      super(sourceFile, options);
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
    if (/^(Component|Directive)$/.test(name) && arg) {
      this.validateProperty(className, name, arg);
    }
  }

  private validateProperty(className: string, decoratorName: string, arg: ts.ObjectLiteralExpression) {
    if (arg.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      (<ts.ObjectLiteralExpression>arg).properties.filter(prop => (<any>prop.name).text === this.config.propertyName)
      .forEach(prop => {
        let p = <any>prop;
        this.addFailure(
          this.createFailure(
            p.getStart(),
            p.getWidth(),
            UseParameterDecorator.formatFailureString(this.config, decoratorName, className)));
      });
    }
  }
}
