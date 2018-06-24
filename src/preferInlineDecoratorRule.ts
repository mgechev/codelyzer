import * as ts from 'typescript';

import { IOptions, IRuleMetadata, Replacement, RuleFailure, Rules } from 'tslint/lib';
import { Decorator, Node, PropertyAccessExpression, SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { getDecoratorName, isSameLine } from './util/utils';

enum Decorators {
  ContentChild = 'ContentChild',
  ContentChildren = 'ContentChildren',
  HostBinding = 'HostBinding',
  HostListener = 'HostListener',
  Input = 'Input',
  Output = 'Output',
  ViewChild = 'ViewChild',
  ViewChildren = 'ViewChildren'
}

type DecoratorKeys = keyof typeof Decorators;

const enumKeys = Object.keys(Decorators);

export const decoratorKeys: ReadonlySet<string> = new Set(enumKeys);

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that decorators are on the same line as the property/method it decorates.',
    descriptionDetails: 'See more at https://angular.io/guide/styleguide#style-05-12.',
    hasFix: true,
    optionExamples: [true, [true, Decorators.HostListener]],
    options: {
      items: {
        enum: enumKeys,
        type: 'string'
      },
      maxLength: decoratorKeys.size,
      minLength: 0,
      type: 'array'
    },
    optionsDescription: 'A list of blacklisted decorators.',
    rationale: 'Placing the decorator on the same line usually makes for shorter code and still easily identifies the property/method.',
    ruleName: 'prefer-inline-decorator',
    type: 'style',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'Consider placing decorators on the same line as the property/method it decorates';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new PreferInlineDecoratorWalker(sourceFile, this.getOptions()));
  }

  isEnabled(): boolean {
    const {
      metadata: {
        options: { maxLength, minLength }
      }
    } = Rule;
    const { length } = this.ruleArguments;

    return super.isEnabled() && length >= minLength && length <= maxLength;
  }
}

export const getFailureMessage = (): string => {
  return Rule.FAILURE_STRING;
};

export class PreferInlineDecoratorWalker extends NgWalker {
  private readonly blacklistedDecorators: typeof decoratorKeys;

  constructor(source: SourceFile, options: IOptions) {
    super(source, options);
    this.blacklistedDecorators = new Set<string>(options.ruleArguments);
  }

  protected visitMethodDecorator(decorator: Decorator) {
    this.validateDecorator(decorator, decorator.parent!);
    super.visitMethodDecorator(decorator);
  }

  protected visitPropertyDecorator(decorator: Decorator) {
    this.validateDecorator(decorator, decorator.parent!);
    super.visitPropertyDecorator(decorator);
  }

  private validateDecorator(decorator: Decorator, property: Node) {
    const decoratorName = getDecoratorName(decorator) as DecoratorKeys;
    const isDecoratorBlacklisted = this.blacklistedDecorators.has(decoratorName);

    if (isDecoratorBlacklisted) {
      return;
    }

    const decoratorStartPos = decorator.getStart();
    const propertyStartPos = (property as PropertyAccessExpression).name.getStart();

    if (isSameLine(this.getSourceFile(), decoratorStartPos, propertyStartPos)) {
      return;
    }

    const fix = Replacement.deleteFromTo(decorator.getEnd(), propertyStartPos - 1);
    this.addFailureAt(decoratorStartPos, property.getWidth(), getFailureMessage(), fix);
  }
}
