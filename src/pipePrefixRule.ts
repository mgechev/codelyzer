import { sprintf } from 'sprintf-js';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { PipeMetadata } from './angular';
import { NgWalker } from './angular/ngWalker';
import { SelectorValidator } from './util/selectorValidator';
import { getDecoratorArgument } from './util/utils';

export class Rule extends Lint.Rules.AbstractRule {
  static readonly metadata: Lint.IRuleMetadata = {
    description: 'Enforce consistent prefix for pipes.',
    optionExamples: [
      [true, 'myPrefix'],
      [true, 'myPrefix', 'myOtherPrefix'],
    ],
    options: {
      items: [
        {
          type: 'string',
        },
      ],
      minLength: 1,
      type: 'array',
    },
    optionsDescription: Lint.Utils.dedent`
      * The list of arguments are supported prefixes (given as strings).
    `,
    rationale: 'Consistent conventions make it easy to quickly identify and reference assets of different types.',
    ruleName: 'pipe-prefix',
    type: 'style',
    typescriptOnly: true,
  };

  static FAILURE_STRING = `The name of the Pipe decorator of class %s should start with prefix %s, however its value is "%s"`;

  prefix: string;
  private prefixChecker: Function;

  constructor(options: Lint.IOptions) {
    super(options);

    let args = options.ruleArguments;
    if (!(args instanceof Array)) {
      args = [args];
    }
    this.prefix = args.join(',');
    let prefixExpression = args.join('|');
    this.prefixChecker = SelectorValidator.prefix(prefixExpression, 'camelCase');
  }

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const walker = new Walker(sourceFile, this);

    return this.applyWithWalker(walker);
  }

  isEnabled(): boolean {
    const {
      metadata: {
        options: { minLength },
      },
    } = Rule;
    const { length } = this.ruleArguments;

    return super.isEnabled() && length >= minLength;
  }

  validatePrefix(prefix: string): boolean {
    return this.prefixChecker(prefix);
  }
}

class Walker extends NgWalker {
  constructor(sourceFile: ts.SourceFile, private rule: Rule) {
    super(sourceFile, rule.getOptions());
  }

  protected visitNgPipe(metadata: PipeMetadata) {
    let className = metadata.controller.name!.text;
    this.validateProperties(className, metadata.decorator);
    super.visitNgPipe(metadata);
  }

  private validateProperties(className: string, pipe: ts.Decorator) {
    const argument = getDecoratorArgument(pipe)!;

    argument.properties
      .filter((p) => p.name && ts.isIdentifier(p.name) && p.name.text === 'name')
      .forEach(this.validateProperty.bind(this, className));
  }

  private validateProperty(className: string, property: ts.Node) {
    const initializer = ts.isPropertyAssignment(property) ? property.initializer : undefined;

    if (initializer && ts.isStringLiteral(initializer)) {
      const propName = initializer.text;
      const isValid = this.rule.validatePrefix(propName);

      if (!isValid) {
        this.addFailureAtNode(property, sprintf(Rule.FAILURE_STRING, className, this.rule.prefix, propName));
      }
    }
  }
}
