import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { SelectorValidator } from './util/selectorValidator';
import { getDecoratorArgument } from './util/utils';

const OPTION_ATTRIBUTE = 'attribute';
const OPTION_CAMEL_CASE = 'camelCase';
const OPTION_KEBAB_CASE = 'kebab-case';

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    deprecationMessage: `You can name your pipes only ${OPTION_CAMEL_CASE}. If you try to use snake-case then your application will not compile. For prefix validation use pipe-prefix rule.`,
    description: 'Enforce consistent case and prefix for pipes.',
    optionExamples: [
      [true, OPTION_CAMEL_CASE, 'myPrefix'],
      [true, OPTION_CAMEL_CASE, 'myPrefix', 'myOtherPrefix'],
      [true, OPTION_KEBAB_CASE, 'my-prefix']
    ],
    options: {
      items: [
        {
          enum: [OPTION_KEBAB_CASE, OPTION_ATTRIBUTE]
        },
        {
          type: 'string'
        }
      ],
      minLength: 1,
      type: 'array'
    },
    optionsDescription: Lint.Utils.dedent`
      * The first item in the array is \`${OPTION_CAMEL_CASE}\` or \`${OPTION_KEBAB_CASE}\`, which allows you to pick a case.
      * The rest of the arguments are supported prefixes (given as strings). They are optional.
    `,
    rationale: 'Consistent conventions make it easy to quickly identify and reference assets of different types.',
    ruleName: 'pipe-naming',
    type: 'style',
    typescriptOnly: true
  };

  static FAILURE_WITHOUT_PREFIX = `The name of the Pipe decorator of class %s should be named ${OPTION_CAMEL_CASE}, however its value is "%s"`;

  static FAILURE_WITH_PREFIX = `The name of the Pipe decorator of class %s should be named ${OPTION_CAMEL_CASE} with prefix %s, however its value is "%s"`;

  prefix!: string;
  hasPrefix!: boolean;
  private prefixChecker!: Function;
  private validator!: Function;

  constructor(options: Lint.IOptions) {
    super(options);

    let args = options.ruleArguments;
    if (!(args instanceof Array)) {
      args = [args];
    }
    if (args[0] === OPTION_CAMEL_CASE) {
      this.validator = SelectorValidator.camelCase;
    }
    if (args.length > 1) {
      this.hasPrefix = true;
      let prefixExpression = (args.slice(1) || []).join('|');
      this.prefix = (args.slice(1) || []).join(',');
      this.prefixChecker = SelectorValidator.prefix(prefixExpression, OPTION_CAMEL_CASE);
    }
  }

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ClassMetadataWalker(sourceFile, this));
  }

  isEnabled(): boolean {
    const {
      metadata: {
        options: { minLength }
      }
    } = Rule;
    const { length } = this.ruleArguments;

    return super.isEnabled() && length >= minLength;
  }

  validateName(name: string): boolean {
    return this.validator(name);
  }

  validatePrefix(prefix: string): boolean {
    return this.prefixChecker(prefix);
  }
}

export class ClassMetadataWalker extends NgWalker {
  constructor(sourceFile: ts.SourceFile, private rule: Rule) {
    super(sourceFile, rule.getOptions());
  }

  protected visitNgPipe(controller: ts.ClassDeclaration, decorator: ts.Decorator) {
    let className = controller.name!.text;
    this.validateProperties(className, decorator);
    super.visitNgPipe(controller, decorator);
  }

  private validateProperties(className: string, pipe: ts.Decorator) {
    const argument = getDecoratorArgument(pipe)!;

    argument.properties
      .filter(p => p.name && ts.isIdentifier(p.name) && p.name.text === 'name')
      .forEach(this.validateProperty.bind(this, className));
  }

  private validateProperty(className: string, property: ts.Node) {
    const initializer = ts.isPropertyAssignment(property) ? property.initializer : undefined;

    if (initializer && ts.isStringLiteral(initializer)) {
      const propName = initializer.text;
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
