import { ElementAst } from '@angular/compiler';
import { IOptions, IRuleMetadata, RuleFailure } from 'tslint/lib';
import { AbstractRule } from 'tslint/lib/rules';
import { dedent } from 'tslint/lib/utils';
import { SourceFile } from 'typescript/lib/typescript';
import { ComponentMetadata } from './angular/metadata';
import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { isChildNodeOf } from './util/isChildNodeOf';
import { objectKeys } from './util/objectKeys';

const OPTION_CONTROL_COMPONENTS = 'controlComponents';
const OPTION_LABEL_ATTRIBUTES = 'labelAttributes';
const OPTION_LABEL_COMPONENTS = 'labelComponents';

const OPTION_SCHEMA_VALUE = {
  properties: {
    items: {
      type: 'string',
    },
    type: 'array',
    uniqueItems: true,
  },
  type: 'object',
};

const DEFAULT_CONTROL_COMPONENTS = ['button', 'input', 'meter', 'output', 'progress', 'select', 'textarea'];
const DEFAULT_LABEL_ATTRIBUTES = ['for', 'htmlFor'];
const DEFAULT_LABEL_COMPONENTS = ['label'];

type OptionKeys = typeof OPTION_CONTROL_COMPONENTS | typeof OPTION_LABEL_ATTRIBUTES | typeof OPTION_LABEL_COMPONENTS;

type OptionDictionary = Readonly<Record<OptionKeys, ReadonlyArray<string>>>;

const getReadableItems = (items: ReadonlyArray<string>): string => {
  const { length: itemsLength } = items;

  if (itemsLength === 1) return `"${items[0]}"`;

  return `${items
    .map((x) => `"${x}"`)
    .slice(0, itemsLength - 1)
    .join(', ')} and "${[...items].pop()}"`;
};

export class Rule extends AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Checks if a label component is associated with a form element',
    optionExamples: [
      true,
      [
        true,
        {
          [OPTION_CONTROL_COMPONENTS]: ['app-input'],
        },
      ],
      [
        true,
        {
          [OPTION_CONTROL_COMPONENTS]: ['app-input', 'app-select'],
          [OPTION_LABEL_ATTRIBUTES]: ['id'],
          [OPTION_LABEL_COMPONENTS]: ['app-label'],
        },
      ],
    ],
    options: {
      additionalProperties: false,
      properties: {
        [OPTION_CONTROL_COMPONENTS]: OPTION_SCHEMA_VALUE,
        [OPTION_LABEL_ATTRIBUTES]: OPTION_SCHEMA_VALUE,
        [OPTION_LABEL_COMPONENTS]: OPTION_SCHEMA_VALUE,
      },
      type: 'object',
    },
    optionsDescription: dedent`
      An optional object with optional \`${OPTION_CONTROL_COMPONENTS}\`, \`${OPTION_LABEL_ATTRIBUTES}\` and \`${OPTION_LABEL_COMPONENTS}\` properties.

      * \`${OPTION_CONTROL_COMPONENTS}\` - components that must be inside a label component. Default and non overridable values are
      ${getReadableItems(DEFAULT_CONTROL_COMPONENTS)}.
      * \`${OPTION_LABEL_ATTRIBUTES}\` - attributes that must be set on label components. Default and non overridable values are
      ${getReadableItems(DEFAULT_LABEL_ATTRIBUTES)}.
      * \`${OPTION_LABEL_COMPONENTS}\` - components that act like a label. Default and non overridable values are
      ${getReadableItems(DEFAULT_LABEL_COMPONENTS)}.
    `,
    ruleName: 'template-accessibility-label-for',
    type: 'functionality',
    typescriptOnly: true,
  };

  static readonly FAILURE_STRING = 'A label component must be associated with a form element';

  apply(sourceFile: SourceFile): RuleFailure[] {
    const walkerConfig: NgWalkerConfig = { templateVisitorCtrl: TemplateVisitorCtrl };
    const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);

    return this.applyWithWalker(walker);
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
      ruleArgumentsKeys.every((argumentKey) => propertiesKeys.includes(argumentKey)) &&
      ruleArgumentsKeys
        .map((argumentKey) => ruleArgument[argumentKey])
        .every((argumentValue) => Array.isArray(argumentValue) && argumentValue.length > 0)
    );
  }
}

class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
  private readonly controlComponents: ReadonlySet<string>;
  private readonly labelAttributes: ReadonlySet<string>;
  private readonly labelComponents: ReadonlySet<string>;

  constructor(sourceFile: SourceFile, options: IOptions, context: ComponentMetadata, templateStart: number) {
    super(sourceFile, options, context, templateStart);

    const { controlComponents, labelAttributes, labelComponents } = (options.ruleArguments[0] || {}) as OptionDictionary;

    this.controlComponents = new Set([...DEFAULT_CONTROL_COMPONENTS.concat(controlComponents)]);
    this.labelAttributes = new Set([...DEFAULT_LABEL_ATTRIBUTES.concat(labelAttributes)]);
    this.labelComponents = new Set([...DEFAULT_LABEL_COMPONENTS.concat(labelComponents)]);
  }

  visitElement(element: ElementAst, context: any): any {
    this.validateElement(element);
    super.visitElement(element, context);
  }

  private hasControlComponentInsideElement(element: ElementAst): boolean {
    return Array.from(this.controlComponents).some((controlComponentName) => isChildNodeOf(element, controlComponentName));
  }

  private hasValidAttrOrInput(element: ElementAst): boolean {
    return [...element.attrs, ...element.inputs]
      .map((attrOrInput) => attrOrInput.name)
      .some((attrOrInputName) => this.labelAttributes.has(attrOrInputName));
  }

  private isLabelComponent(element: ElementAst): boolean {
    return this.labelComponents.has(element.name);
  }

  private validateElement(element: ElementAst): void {
    if (!this.isLabelComponent(element) || this.hasValidAttrOrInput(element) || this.hasControlComponentInsideElement(element)) {
      return;
    }

    const {
      sourceSpan: {
        end: { offset: endOffset },
        start: { offset: startOffset },
      },
    } = element;

    this.addFailureFromStartToEnd(startOffset, endOffset, Rule.FAILURE_STRING);
  }
}
