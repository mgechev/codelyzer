import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';
import {SelectorValidator} from './util/selectorValidator';
import {compose} from './util/util';
import {sprintf} from 'sprintf-js';

export abstract class SelectorNameRule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING = 'Invalid selector "%s" for %s "%s". Set your selectors to be %ss, named %s with "%s" prefix.';

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
    let args = options.ruleArguments;
    let name = args[1];
    if (name === 'kebab-case') {
      name = 'kebabCase';
    }
    let selectorTypeValidator = SelectorValidator[args[0]];
    let nameValidator = SelectorValidator[name];
    let prefixValidator = SelectorValidator.prefix(args[2]);
    if (!selectorTypeValidator) {
      throw new Error(`${args[0]} is invalid selector type. Use "attribute" or "element".`);
    }
    if (!nameValidator) {
      throw new Error(`${args[1]} is invalid name type. Use "kebab-case" or "camelCase".`)
    }
    this.validator = compose(selectorTypeValidator, nameValidator, prefixValidator);
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
          let a = this.getOptions();
          let error = sprintf(SelectorNameRule.FAILURE_STRING, p.initializer.text, unitType, className, a[0], a[1], a[2]);
          this.addFailure(this.createFailure(p.initializer.getStart(), p.initializer.getWidth(), error));
        }
      });
    }
  }
}
