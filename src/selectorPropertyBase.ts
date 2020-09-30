import { CssSelector } from '@angular/compiler';
import { IOptions, RuleFailure, WalkContext } from 'tslint';
import { AbstractRule } from 'tslint/lib/rules';
import { arrayify } from 'tslint/lib/utils';
import {
  ClassDeclaration,
  createNodeArray,
  Decorator,
  forEachChild,
  isClassDeclaration,
  Node,
  SourceFile,
  StringLiteralLike,
} from 'typescript';
import { SelectorValidator } from './util/selectorValidator';
import { getDecoratorName, getDecoratorPropertyInitializer, isStringLiteralLike } from './util/utils';

export const OPTION_STYLE_CAMEL_CASE = 'camelCase';
export const OPTION_STYLE_KEBAB_CASE = 'kebab-case';
export const OPTION_TYPE_ATTRIBUTE = 'attribute';
export const OPTION_TYPE_ATTRS = 'attrs';
export const OPTION_TYPE_ELEMENT = 'element';

export type SelectorStyle = typeof OPTION_STYLE_CAMEL_CASE | typeof OPTION_STYLE_KEBAB_CASE;
export type SelectorType = typeof OPTION_TYPE_ATTRIBUTE | typeof OPTION_TYPE_ELEMENT;
export type SelectorTypeInternal = typeof OPTION_TYPE_ATTRS | typeof OPTION_TYPE_ELEMENT;

const SELECTOR_TYPE_MAPPER: Record<SelectorType, SelectorTypeInternal> = {
  [OPTION_TYPE_ATTRIBUTE]: OPTION_TYPE_ATTRS,
  [OPTION_TYPE_ELEMENT]: OPTION_TYPE_ELEMENT,
};

export abstract class SelectorPropertyBase extends AbstractRule {
  abstract readonly handleType: string;
  internalTypes: ReadonlyArray<SelectorType>;
  prefixes: ReadonlyArray<string>;
  style: SelectorStyle;
  types: ReadonlyArray<SelectorTypeInternal>;

  constructor(options: IOptions) {
    super(options);

    const { ruleArguments } = this.getOptions();

    this.internalTypes = arrayify(ruleArguments[0]);
    this.prefixes = arrayify<SelectorStyle>(ruleArguments[1]);
    this.style = ruleArguments[2];
    this.types = arrayify<SelectorType>(ruleArguments[0] || [OPTION_TYPE_ATTRIBUTE, OPTION_TYPE_ELEMENT]).reduce<
      ReadonlyArray<SelectorTypeInternal>
    >((previousValue, currentValue) => previousValue.concat(SELECTOR_TYPE_MAPPER[currentValue]), []);
  }

  abstract getPrefixFailure(prefixes: ReadonlyArray<string>): string;
  abstract getStyleFailure(style: SelectorStyle): string;
  abstract getTypeFailure(types: ReadonlyArray<SelectorType>): string;

  getValidSelectors(selectors: CssSelector[]): ReadonlyArray<string> {
    return selectors.reduce<ReadonlyArray<string>>((previousValue, currentValue) => {
      const validSelectors = this.types.reduce<ReadonlyArray<string>>((accumulator, type) => {
        const value = currentValue[type];

        return value ? accumulator.concat(value) : accumulator;
      }, []);

      return previousValue.concat(validSelectors);
    }, []);
  }

  validatePrefixes(selectors: ReadonlyArray<string>): boolean {
    return selectors.some((selector) => this.prefixes.some((prefix) => SelectorValidator.prefix(prefix, this.style)(selector)));
  }

  validateStyle(selectors: ReadonlyArray<string>): boolean {
    const validator = this.style === OPTION_STYLE_KEBAB_CASE ? SelectorValidator.kebabCase : SelectorValidator.camelCase;

    return selectors.some((selector) => validator(selector));
  }

  validateTypes(selectors: ReadonlyArray<string>): boolean {
    return selectors.length > 0;
  }

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk, this);
  }
}

const validateClassDeclaration = (context: WalkContext<SelectorPropertyBase>, node: ClassDeclaration): void =>
  createNodeArray(node.decorators).forEach((decorator) => validateDecorator(context, decorator));

const validateDecorator = (context: WalkContext<SelectorPropertyBase>, decorator: Decorator): void => {
  const selectorExpression = getDecoratorPropertyInitializer(decorator, 'selector');
  const decoratorName = getDecoratorName(decorator);

  if (!selectorExpression || !isStringLiteralLike(selectorExpression) || context.options.handleType !== decoratorName) {
    return;
  }

  validateSelector(context, selectorExpression);
};

const validateSelector = (context: WalkContext<SelectorPropertyBase>, expression: StringLiteralLike): void => {
  const { options } = context;
  const selectors = CssSelector.parse(expression.text);
  const validSelectors = options.getValidSelectors(selectors);
  let failure: string | undefined;

  if (!options.validateTypes(validSelectors)) {
    failure = options.getTypeFailure(options.internalTypes);
  } else if (!options.validateStyle(validSelectors)) {
    failure = options.getStyleFailure(options.style);
  } else if (!options.validatePrefixes(validSelectors)) {
    failure = options.getPrefixFailure(options.prefixes);
  }

  if (failure) {
    context.addFailureAtNode(expression, failure);
  }
};

const walk = (context: WalkContext<SelectorPropertyBase>): void => {
  const { sourceFile } = context;

  const callback = (node: Node): void => {
    if (isClassDeclaration(node)) validateClassDeclaration(context, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
