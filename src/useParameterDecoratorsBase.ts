import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';

export interface IUseParameterDecoratorConfig {
  propertyName: string;
  decoratorName: string;
  errorMessage: string;
}

export class DirectiveMetadataWalker extends Lint.RuleWalker {
  private languageService : ts.LanguageService;
  private typeChecker : ts.TypeChecker;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions,
    languageService : ts.LanguageService, private config: IUseParameterDecoratorConfig) {
      super(sourceFile, options);
      this.languageService = languageService;
      this.typeChecker = languageService.getProgram().getTypeChecker();
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    node.decorators.forEach(this.validateDecorator.bind(this, node.name.text));
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
            sprintf(this.config.errorMessage, decoratorName, className, this.config.propertyName, this.config.decoratorName)));
      });
    }
  }
}
