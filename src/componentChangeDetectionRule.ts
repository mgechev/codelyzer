import { Utils } from 'tslint/lib';
import * as Lint from 'tslint';
import * as ts from 'typescript';
import { getDecoratorArgument, getDecoratorName } from './util/utils';
import { sprintf } from 'sprintf-js';
import { NgWalker } from './angular';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'component-change-detection',
    type: 'functionality',
    description: 'Enforce the preferred component change detection type as ChangeDetectionStrategy.OnPush.',
    descriptionDetails: Utils.dedent`
      See more at https://angular.io/api/core/ChangeDetectionStrategy
    `,
    options: null,
    optionsDescription: 'Not configurable.',
    rationale: Utils.dedent`
      By using OnPush for change detection, Angular will only run a change detection cycle when that 
      components inputs or outputs change
    `,
    typescriptOnly: true
  };

  static CHANGE_DETECTION_INVALID_FAILURE =
    'The changeDetection value of the component "%s" should be set to ChangeDetectionStrategy.OnPush';

  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new ComponentChangeDetectionValidatorWalker(sourceFile, this));
  }
}

export class ComponentChangeDetectionValidatorWalker extends NgWalker {
  constructor(sourceFile: ts.SourceFile, private rule: Rule) {
    super(sourceFile, rule.getOptions());
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    ts.createNodeArray(node.decorators).forEach(this.validateDecorator.bind(this, node.name!.text));
    super.visitClassDeclaration(node);
  }

  private validateDecorator(className: string, decorator: ts.Decorator) {
    const argument = getDecoratorArgument(decorator)!;
    const name = getDecoratorName(decorator);

    // Run only for Components
    if (name === 'Component') {
      this.validateComponentChangeDetection(className, decorator, argument);
    }
  }

  private validateComponentChangeDetection(className: string, decorator: ts.Decorator, arg: ts.Node) {
    if (!ts.isObjectLiteralExpression(arg)) {
      return;
    }

    const changeDetectionAssignment = arg.properties
      .filter(prop => ts.isPropertyAssignment(prop) && this.validateProperty(prop))
      .map(prop => (ts.isPropertyAssignment(prop) ? prop.initializer : undefined))
      .filter(Boolean)[0] as ts.PropertyAccessExpression;

    if (!changeDetectionAssignment) {
      this.addFailureAtNode(decorator, sprintf(Rule.CHANGE_DETECTION_INVALID_FAILURE, className));
    } else {
      if (!this.validateChangeDetectionType(changeDetectionAssignment!.name.escapedText as string)) {
        this.addFailureAtNode(changeDetectionAssignment, sprintf(Rule.CHANGE_DETECTION_INVALID_FAILURE, className));
      }
    }
  }

  private validateProperty(p: ts.PropertyAssignment): boolean {
    return ts.isIdentifier(p.name) && p.name.text === 'changeDetection';
  }

  private validateChangeDetectionType(changeDetectionValue: string): boolean {
    return changeDetectionValue === 'OnPush';
  }
}
