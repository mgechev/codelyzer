import { IOptions, IRuleMetadata, Replacement, RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { Decorator, isPropertyDeclaration, SourceFile } from 'typescript';
import { NgWalker } from './angular/ngWalker';
import { decoratorKeys, Decorators, DECORATORS, getDecoratorName, isSameLine } from './util/utils';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that decorators are on the same line as the property/method it decorates.',
    descriptionDetails: 'See more at https://angular.io/guide/styleguide#style-05-12.',
    hasFix: true,
    optionExamples: [true, [true, Decorators.HostListener]],
    options: {
      items: {
        enum: decoratorKeys,
        type: 'string'
      },
      maxLength: DECORATORS.size,
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

export class PreferInlineDecoratorWalker extends NgWalker {
  private readonly blacklistedDecorators: ReadonlySet<string>;

  constructor(source: SourceFile, options: IOptions) {
    super(source, options);
    this.blacklistedDecorators = new Set(options.ruleArguments);
  }

  protected visitMethodDecorator(decorator: Decorator): void {
    this.validateDecorator(decorator);
    super.visitMethodDecorator(decorator);
  }

  protected visitPropertyDecorator(decorator: Decorator): void {
    this.validateDecorator(decorator);
    super.visitPropertyDecorator(decorator);
  }

  private validateDecorator(decorator: Decorator): void {
    const decoratorName = getDecoratorName(decorator);

    if (!decoratorName) return;

    const isDecoratorBlacklisted = this.blacklistedDecorators.has(decoratorName);

    if (isDecoratorBlacklisted) return;

    const decoratorStartPos = decorator.getStart();
    const { parent: property } = decorator;

    if (!property || !isPropertyDeclaration(property)) return;

    const propertyStartPos = property.name.getStart();

    if (isSameLine(this.getSourceFile(), decoratorStartPos, propertyStartPos)) return;

    const fix = Replacement.deleteFromTo(decorator.getEnd(), propertyStartPos - 1);

    this.addFailureAt(decoratorStartPos, property.getWidth(), Rule.FAILURE_STRING, fix);
  }
}
