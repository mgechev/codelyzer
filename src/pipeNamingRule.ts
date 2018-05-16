import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import SyntaxKind = require('./util/syntaxKind');
import { NgWalker } from './angular/ngWalker';
import { SelectorValidator } from './util/selectorValidator';
import { IOptions } from 'tslint';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    deprecationMessage: 'You can name your pipes only camelCase. If you try to use snake-case then your application will not compile.',
    ruleName: 'pipe-naming',
    type: 'style',
    description: 'Enforce consistent case and prefix for pipes.',
    rationale: 'Consistent conventions make it easy to quickly identify and reference assets of different types.',
    options: {
      type: 'array',
      items: [{ enum: ['kebab-case', 'attribute'] }, { type: 'string' }],
      minItems: 1
    },
    optionExamples: ['["camelCase", "myPrefix"]', '["camelCase", "myPrefix", "myOtherPrefix"]', '["kebab-case", "my-prefix"]'],
    optionsDescription: Lint.Utils.dedent`
    * The first item in the array is \`"kebab-case"\` or \`"camelCase"\`, which allows you to pick a case.
    * The rest of the arguments are supported prefixes (given as strings). They are optional.`,
    typescriptOnly: true
  };

  static FAILURE_WITHOUT_PREFIX = 'The name of the Pipe decorator of class %s should' + ' be named camelCase, however its value is "%s"';

  static FAILURE_WITH_PREFIX = 'The name of the Pipe decorator of class %s should' +
  ' be named camelCase with prefix %s, however its value is "%s"';

  public prefix: string;
  public hasPrefix: boolean;
  private prefixChecker: Function;
  private validator: Function;

  constructor(options: IOptions) {
    super(options);

    let args = options.ruleArguments;
    if (!(args instanceof Array)) {
      args = [args];
    }
    if (args[0] === 'camelCase') {
      this.validator = SelectorValidator.camelCase;
    }
    if (args.length > 1) {
      this.hasPrefix = true;
      let prefixExpression: string = (args.slice(1) || []).join('|');
      this.prefix = (args.slice(1) || []).join(',');
      this.prefixChecker = SelectorValidator.prefix(prefixExpression, 'camelCase');
    }
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this));
  }

  public validateName(name: string): boolean {
    return this.validator(name);
  }

  public validatePrefix(prefix: string): boolean {
    return this.prefixChecker(prefix);
  }
}

export class ClassMetadataWalker extends NgWalker {
  constructor(sourceFile: ts.SourceFile, private rule: Rule) {
    super(sourceFile, rule.getOptions());
  }

  protected visitNgPipe(controller: ts.ClassDeclaration, decorator: ts.Decorator) {
    let className = controller.name.text;
    this.validateProperties(className, decorator);
    super.visitNgPipe(controller, decorator);
  }

  private validateProperties(className: string, pipe: ts.Decorator) {
    let argument = this.extractArgument(pipe);
    if (argument && argument.kind === SyntaxKind.current().ObjectLiteralExpression) {
      (<ts.ObjectLiteralExpression>argument).properties
        .filter(n => n.name && (<ts.StringLiteral>n.name).text === 'name')
        .forEach(this.validateProperty.bind(this, className));
    }
  }

  private extractArgument(pipe: ts.Decorator): ts.Expression | undefined {
    const baseExpr = <ts.CallExpression>pipe.expression;
    if (baseExpr.arguments) {
      const args = baseExpr.arguments;
      return args[0];
    }
    return undefined;
  }

  private validateProperty(className: string, property: ts.Node) {
    const init = (<ts.PropertyAssignment>property).initializer;
    if (init && (<ts.StringLiteral>init).text) {
      const propName = (<ts.StringLiteral>init).text;
      const isValidName = this.rule.validateName(propName);
      const isValidPrefix = this.rule.hasPrefix ? this.rule.validatePrefix(propName) : true;
      if (!isValidName || !isValidPrefix) {
        this.addFailureAtNode(property, this.getFailureMessage(className, propName));
      }
    }
  }

  private getFailureMessage(className: string, pipeName: string): string {
    if (this.rule.hasPrefix) {
      return sprintf(Rule.FAILURE_WITH_PREFIX, className, this.rule.prefix, pipeName);
    }
    return sprintf(Rule.FAILURE_WITHOUT_PREFIX, className, pipeName);
  }
}
