import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';
import {SelectorValidator} from './util/selectorValidator';
import {compose} from './util/util';
import {sprintf} from 'sprintf-js';

const VALIDATORS_MAP = {
  'kebab-case': 'kebabCase',
  'camelCase': 'camelCase',
  'attribute': 'attribute',
  'element': 'element'
};

export abstract class SelectorNameRule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = 'Invalid selector "%s" for %s "%s".';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    let documentRegistry = ts.createDocumentRegistry();
    let languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
    let languageService : ts.LanguageService = ts.createLanguageService(languageServiceHost, documentRegistry);
    return this.applyWithWalker(new SelectorNameValidatorWalker(sourceFile, this.normalizeOptions(this.getOptions()), languageService));
  }

  protected abstract normalizeOptions(options: Lint.IOptions);
}

class SelectorNameValidatorWalker extends Lint.RuleWalker {
  private languageService : ts.LanguageService;
  private typeChecker : ts.TypeChecker;
  private validator: Function;

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions, languageService : ts.LanguageService) {
    super(sourceFile, options);
    this.validator = compose.apply(null, options.ruleArguments.filter(a => typeof a === 'string')
      .map(a => SelectorValidator[VALIDATORS_MAP[a]]));
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
    if (name === 'Component' && arg) {
      this.validateSelector('component', className, arg);
    } else if (name === 'Directive' && arg) {
      this.validateSelector('directive', className, arg);
    }
  }

  private validateSelector(unitType: string, className: string, arg: ts.Node) {
    if (arg.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      (<ts.ObjectLiteralExpression>arg).properties.filter(prop => (<any>prop.name).text === 'selector')
      .forEach(prop => {
        let p = <any>prop;
        let type = this.typeChecker.getTypeAtLocation(p.initializer);
        if (type.flags === ts.TypeFlags.String && !this.validator(p.initializer.text)) {
          let error = sprintf(SelectorNameRule.FAILURE_STRING, p.initializer.text, unitType, className);
          this.addFailure(this.createFailure(p.initializer.getStart(), p.initializer.getWidth(), error));
        }
      });
    }
  }
}
