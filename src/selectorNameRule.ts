import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';
import {SelectorValidator} from './util/selectorValidator';

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = 'Invalid selector %s for component %s.';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    let documentRegistry = ts.createDocumentRegistry();
    let languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
    let languageService : ts.LanguageService = ts.createLanguageService(languageServiceHost, documentRegistry);
    return this.applyWithWalker(new SelectorNameValidatorWalker(sourceFile, this.getOptions(), languageService));
  }
}

class SelectorNameValidatorWalker extends Lint.RuleWalker {
  private languageService : ts.LanguageService;
  private typeChecker : ts.TypeChecker;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions, languageService : ts.LanguageService) {
    super(sourceFile, options);
    this.languageService = languageService;
    this.typeChecker = languageService.getProgram().getTypeChecker();
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    node.decorators.forEach(this.validateDecorator.bind(this));
    super.visitClassDeclaration(node);
  }

  private validateDecorator(decorator: ts.Decorator) {
    let baseExpr = (<any>decorator.expression);
    let expr = baseExpr.expression || {};
    let name = expr.text;
    let args = (<any>decorator.expression).arguments || [];
    let arg = args[0];
    let errorSuffix = null;
    if (name === 'Component' && !this.validateSelector(arg, SelectorValidator.component)) {
      errorSuffix = Rule.FAILURE_STRING;
    } else if (name === 'Directive' && !this.validateSelector(arg, SelectorValidator.directive)) {
      errorSuffix = Rule.FAILURE_STRING;
    }
    if (errorSuffix) {
      this.addFailure(this.createFailure(decorator.getStart(), decorator.getWidth(), errorSuffix));
    }
  }

  private validateSelector(arg: ts.Node, strategy) {
    if (arg.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      (<any>arg).properties.forEach(prop => {
        if (prop.name.text === 'selector') {
          let type = this.typeChecker.getTypeAtLocation(prop.initializer);
          if (type.flags === ts.TypeFlags.String && !strategy(prop.initializer.text)) {
            return false;
          }
        }
      });
    }
  }
}
