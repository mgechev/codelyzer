import { IRuleMetadata, RuleFailure, WalkContext } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import {
  createNodeArray,
  Decorator,
  forEachChild,
  GetAccessorDeclaration,
  isGetAccessorDeclaration,
  isMethodDeclaration,
  isParameter,
  isParameterPropertyDeclaration,
  isPropertyDeclaration,
  isSetAccessorDeclaration,
  MethodDeclaration,
  Node,
  ParameterDeclaration,
  ParameterPropertyDeclaration,
  PropertyDeclaration,
  SetAccessorDeclaration,
  SourceFile,
} from 'typescript';
import { isNotNullOrUndefined } from './util/isNotNullOrUndefined';
import { objectKeys } from './util/objectKeys';
import { AngularInnerClassDecorators, getDecoratorName, isSameLine } from './util/utils';

const OPTION_GETTERS = 'getters';
const OPTION_METHODS = 'methods';
const OPTION_PARAMETER_PROPERTIES = 'parameter-properties';
const OPTION_PARAMETERS = 'parameters';
const OPTION_PROPERTIES = 'properties';
const OPTION_SETTERS = 'setters';

const OPTION_SAFELIST = 'safelist';

const OPTION_SCHEMA_VALUE = {
  oneOf: [
    {
      type: 'boolean',
    },
    {
      properties: {
        items: {
          type: 'string',
        },
        type: 'array',
        uniqueItems: true,
      },
      type: 'object',
    },
  ],
};

type OptionKeys =
  | typeof OPTION_GETTERS
  | typeof OPTION_METHODS
  | typeof OPTION_PARAMETER_PROPERTIES
  | typeof OPTION_PARAMETERS
  | typeof OPTION_PROPERTIES
  | typeof OPTION_SETTERS;

type Safelist = Record<typeof OPTION_SAFELIST, ReadonlyArray<string>>;

type OptionValue = boolean | Safelist;

type OptionDictionary = Record<OptionKeys, OptionValue>;

type Declaration =
  | GetAccessorDeclaration
  | MethodDeclaration
  | ParameterDeclaration
  | ParameterPropertyDeclaration
  | PropertyDeclaration
  | SetAccessorDeclaration;

const DEFAULT_OPTIONS: OptionDictionary = {
  [OPTION_GETTERS]: true,
  [OPTION_METHODS]: true,
  [OPTION_PARAMETER_PROPERTIES]: true,
  [OPTION_PARAMETERS]: true,
  [OPTION_PROPERTIES]: true,
  [OPTION_SETTERS]: true,
};

const STYLE_GUIDE_LINK = 'https://angular.io/guide/styleguide#style-05-12';

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Ensures that declarations are on the same line as its decorator(s).',
    descriptionDetails: `See more at ${STYLE_GUIDE_LINK}.`,
    optionExamples: [
      true,
      [true, { [OPTION_METHODS]: false }],
      [
        true,
        {
          [OPTION_GETTERS]: {
            [OPTION_SAFELIST]: [AngularInnerClassDecorators.Input],
          },
          [OPTION_METHODS]: true,
          [OPTION_PARAMETER_PROPERTIES]: false,
          [OPTION_PARAMETERS]: false,
          [OPTION_PROPERTIES]: {
            [OPTION_SAFELIST]: [AngularInnerClassDecorators.Output, 'MyCustomDecorator'],
          },
          [OPTION_SETTERS]: true,
        },
      ],
    ],
    options: {
      additionalProperties: false,
      properties: {
        [OPTION_GETTERS]: OPTION_SCHEMA_VALUE,
        [OPTION_METHODS]: OPTION_SCHEMA_VALUE,
        [OPTION_PARAMETER_PROPERTIES]: OPTION_SCHEMA_VALUE,
        [OPTION_PARAMETERS]: OPTION_SCHEMA_VALUE,
        [OPTION_PROPERTIES]: OPTION_SCHEMA_VALUE,
        [OPTION_SETTERS]: OPTION_SCHEMA_VALUE,
      },
      type: 'object',
    },
    optionsDescription: dedent`
      An optional object with optional \`${OPTION_GETTERS}\`, \`${OPTION_METHODS}\`, \`${OPTION_PARAMETER_PROPERTIES}\`, \`${OPTION_PARAMETERS}\`, \`${OPTION_PROPERTIES}\` and \`${OPTION_SETTERS}\` properties.

      The properties can be specifed as booleans or as objects with the property \`${OPTION_SAFELIST}\` containing the names of the decorators that should be ignored. Note that if a declaration is decorated with multiple decorators and at least one of them is present in \`${OPTION_SAFELIST}\`, this declaration is ignored.

      * \`${OPTION_GETTERS}\` - requires that ${OPTION_GETTERS} are on the same line as its decorator(s). Defaults to \`true\`.
      * \`${OPTION_METHODS}\` - requires that ${OPTION_METHODS} are on the same line as its decorator(s). Defaults to \`true\`.
      * \`${OPTION_PARAMETER_PROPERTIES}\` - requires that parameter properties are on the same line as its decorator(s). Defaults to \`true\`.
      * \`${OPTION_PARAMETERS}\` - requires that ${OPTION_PARAMETERS} are on the same line as its decorator(s). Defaults to \`true\`.
      * \`${OPTION_PROPERTIES}\` - requires that ${OPTION_PROPERTIES} are on the same line as its decorator(s). Defaults to \`true\`.
      * \`${OPTION_SETTERS}\` - requires that ${OPTION_SETTERS} are on the same line as its decorator(s). Defaults to \`true\`.
    `,
    rationale: 'Placing the decorator on the same line usually makes for shorter code and still easily identifies the declarations.',
    ruleName: 'prefer-inline-decorator',
    type: 'style',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = `Place declarations on the same line as its decorator(s) (${STYLE_GUIDE_LINK})`;

  apply(sourceFile: SourceFile): RuleFailure[] {
    const options: OptionDictionary = {
      ...DEFAULT_OPTIONS,
      ...this.ruleArguments[0],
    };

    return this.applyWithFunction(sourceFile, walk, options);
  }

  isEnabled(): boolean {
    return super.isEnabled() && this.areOptionsValid();
  }

  private areOptionsValid(): boolean {
    const { length: ruleArgumentsLength } = this.ruleArguments;

    if (ruleArgumentsLength === 0) return true;

    if (ruleArgumentsLength > 1) return false;

    const {
      metadata: { options: ruleOptions },
    } = Rule;
    const [ruleArgument] = this.ruleArguments as ReadonlyArray<OptionDictionary>;
    const ruleArgumentsKeys = objectKeys(ruleArgument);
    const propertiesKeys = objectKeys(ruleOptions.properties as OptionDictionary);

    return (
      ruleArgumentsKeys.every((argumentKey) => propertiesKeys.indexOf(argumentKey) !== -1) &&
      ruleArgumentsKeys
        .map((argumentKey) => ruleArgument[argumentKey])
        .every((argumentValue) => {
          if (typeof argumentValue === 'boolean') return true;

          if (!argumentValue || typeof argumentValue !== 'object') return false;

          const argumentValueKeys = objectKeys(argumentValue);

          if (argumentValueKeys.length !== 1) return false;

          const safelist = argumentValue[argumentValueKeys[0]];

          return Array.isArray(safelist) && safelist.length > 0;
        })
    );
  }
}

const callbackHandler = (walkContext: WalkContext<OptionDictionary>, node: Node): void => {
  const {
    options: { getters, methods, [OPTION_PARAMETER_PROPERTIES]: parameterProperties, parameters, properties, setters },
  } = walkContext;

  if (getters && isGetAccessorDeclaration(node)) {
    validateGetAccessorDeclaration(walkContext, node);
  } else if (methods && isMethodDeclaration(node)) {
    validateMethodDeclaration(walkContext, node);
  } else if (parameters && isParameter(node) && !isParameterPropertyDeclaration(node, node.parent)) {
    validateParameterDeclaration(walkContext, node);
  } else if (parameterProperties && isParameterPropertyDeclaration(node, node.parent)) {
    validateParameterPropertyDeclaration(walkContext, node);
  } else if (properties && isPropertyDeclaration(node)) {
    validatePropertyDeclaration(walkContext, node);
  } else if (setters && isSetAccessorDeclaration(node)) {
    validateSetAccessorDeclaration(walkContext, node);
  }
};

const canIgnoreDecorator = (walkContext: WalkContext<OptionDictionary>, decoratorName: string, optionKey: OptionKeys): boolean => {
  const {
    options: { [optionKey]: optionValue },
  } = walkContext;

  return optionValue && typeof optionValue === 'object' && optionValue.safelist.indexOf(decoratorName) !== -1;
};

const hasAnyIgnoredDecorator = (
  walkContext: WalkContext<OptionDictionary>,
  decorators: ReadonlyArray<Decorator>,
  optionKey: OptionKeys
): boolean => {
  const nonIgnoredDecoratorNames = decorators
    .map(getDecoratorName)
    .filter(isNotNullOrUndefined)
    .filter((decoratorName) => !canIgnoreDecorator(walkContext, decoratorName, optionKey));

  return decorators.length !== nonIgnoredDecoratorNames.length;
};

const validateDecorators = (
  walkContext: WalkContext<OptionDictionary>,
  decorators: ReadonlyArray<Decorator>,
  declaration: Declaration,
  optionKey: OptionKeys
): void => {
  if (decorators.length === 0 || hasAnyIgnoredDecorator(walkContext, decorators, optionKey)) return;

  const [firstDecorator] = decorators;
  const firstDecoratorStartPos = firstDecorator.getStart();
  const declarationStartPos = declaration.name.getStart();

  if (isSameLine(walkContext.sourceFile, firstDecoratorStartPos, declarationStartPos)) return;

  walkContext.addFailureAt(firstDecoratorStartPos, declaration.getWidth(), Rule.FAILURE_STRING);
};

const validateDeclaration = (walkContext: WalkContext<OptionDictionary>, declaration: Declaration, optionKey: OptionKeys): void => {
  validateDecorators(walkContext, createNodeArray(declaration.decorators), declaration, optionKey);
};

const validateGetAccessorDeclaration = (walkContext: WalkContext<OptionDictionary>, node: GetAccessorDeclaration): void => {
  validateDeclaration(walkContext, node, OPTION_GETTERS);
};

const validateMethodDeclaration = (walkContext: WalkContext<OptionDictionary>, node: MethodDeclaration): void => {
  validateDeclaration(walkContext, node, OPTION_METHODS);
};

const validateParameterDeclaration = (walkContext: WalkContext<OptionDictionary>, node: ParameterDeclaration): void => {
  validateDeclaration(walkContext, node, OPTION_PARAMETERS);
};

const validateParameterPropertyDeclaration = (walkContext: WalkContext<OptionDictionary>, node: ParameterDeclaration): void => {
  validateDeclaration(walkContext, node, OPTION_PARAMETER_PROPERTIES);
};

const validatePropertyDeclaration = (walkContext: WalkContext<OptionDictionary>, node: PropertyDeclaration): void => {
  validateDeclaration(walkContext, node, OPTION_PROPERTIES);
};

const validateSetAccessorDeclaration = (walkContext: WalkContext<OptionDictionary>, node: SetAccessorDeclaration): void => {
  validateDeclaration(walkContext, node, OPTION_SETTERS);
};

const walk = (walkContext: WalkContext<OptionDictionary>): void => {
  const { sourceFile } = walkContext;

  const callback = (node: Node): void => {
    callbackHandler(walkContext, node);

    forEachChild(node, callback);
  };

  forEachChild(sourceFile, callback);
};
