import { IOptions, IRuleMetadata, Replacement, RuleFailure, Rules } from 'tslint/lib';
import { isSameLine } from 'tsutils';
import { Decorator, Node, PropertyAccessExpression, SourceFile } from 'typescript';

import { NgWalker } from './angular/ngWalker';
import { getDecoratorName } from './util/utils';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that decorators are on the same line as the property/method it decorates.',
    descriptionDetails: 'See more at https://angular.io/guide/styleguide#style-05-12.',
    hasFix: true,
    optionExamples: ['true', '[true, "HostListener"]'],
    options: {
      items: {
        type: 'string'
      },
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
}

type DecoratorKeys =
  | 'ContentChild'
  | 'ContentChildren'
  | 'HostBinding'
  | 'HostListener'
  | 'Input'
  | 'Output'
  | 'ViewChild'
  | 'ViewChildren';

export const decoratorKeys = new Set<DecoratorKeys>([
  'ContentChild',
  'ContentChildren',
  'HostBinding',
  'HostListener',
  'Input',
  'Output',
  'ViewChild',
  'ViewChildren'
]);

export class PreferInlineDecoratorWalker extends NgWalker {
  private readonly blacklistedDecorators: typeof decoratorKeys;

  constructor(source: SourceFile, options: IOptions) {
    super(source, options);
    this.blacklistedDecorators = new Set<DecoratorKeys>(options.ruleArguments.slice(1));
  }

  protected visitMethodDecorator(decorator: Decorator) {
    this.validateDecorator(decorator, decorator.parent);
    super.visitMethodDecorator(decorator);
  }

  protected visitPropertyDecorator(decorator: Decorator) {
    this.validateDecorator(decorator, decorator.parent);
    super.visitPropertyDecorator(decorator);
  }

  private validateDecorator(decorator: Decorator, property: Node) {
    const decoratorName: DecoratorKeys = getDecoratorName(decorator);
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
    this.addFailureAt(decoratorStartPos, property.getWidth(), Rule.FAILURE_STRING, fix);
  }
}
