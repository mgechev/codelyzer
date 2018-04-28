import * as ts from 'typescript';
import * as Lint from 'tslint';

import * as ast from './cssAst';
import { SourceMappingVisitor } from '../sourceMappingVisitor';
import { ComponentMetadata, StyleMetadata } from '../metadata';

export interface CssAstVisitorCtrl {
  new (sourceFile: ts.SourceFile, options: Lint.IOptions, context: ComponentMetadata, style: StyleMetadata, templateStart: number);
}

export class BasicCssAstVisitor extends SourceMappingVisitor implements ast.CssAstVisitor {
  constructor(
    sourceFile: ts.SourceFile,
    protected _originalOptions: Lint.IOptions,
    protected context: ComponentMetadata,
    style: StyleMetadata,
    protected templateStart: number
  ) {
    super(sourceFile, _originalOptions, style.style, templateStart);
  }

  visitCssValue(ast: ast.CssStyleValueAst, context?: any): any {}

  visitCssInlineRule(ast: ast.CssInlineRuleAst, context?: any): any {}

  visitCssAtRulePredicate(ast: ast.CssAtRulePredicateAst, context?: any): any {}

  visitCssKeyframeRule(ast: ast.CssKeyframeRuleAst, context?: any): any {
    ast.block.visit(this, context);
  }

  visitCssKeyframeDefinition(ast: ast.CssKeyframeDefinitionAst, context?: any): any {
    ast.block.visit(this, context);
  }

  visitCssMediaQueryRule(ast: ast.CssMediaQueryRuleAst, context?: any): any {
    ast.query.visit(this, context);
    ast.block.visit(this, context);
  }

  visitCssSelectorRule(ast: ast.CssSelectorRuleAst, context?: any): any {
    ast.selectors.forEach((selAst: ast.CssSelectorAst) => {
      selAst.visit(this, context);
    });
    ast.block.visit(this, context);
  }

  visitCssSelector(ast: ast.CssSelectorAst, context?: any): any {
    ast.selectorParts.forEach((simpleAst: ast.CssSimpleSelectorAst) => {
      simpleAst.visit(this, context);
    });
  }

  visitCssSimpleSelector(ast: ast.CssSimpleSelectorAst, context?: any): any {
    ast.pseudoSelectors.forEach((pseudoAst: ast.CssPseudoSelectorAst) => {
      pseudoAst.visit(this, context);
    });
  }

  visitCssPseudoSelector(ast: ast.CssPseudoSelectorAst, context?: any): any {}

  visitCssDefinition(ast: ast.CssDefinitionAst, context?: any): any {
    ast.value.visit(this, context);
  }

  visitCssBlock(ast: ast.CssBlockAst, context?: any): any {
    ast.entries.forEach((entryAst: ast.CssAst) => {
      entryAst.visit(this, context);
    });
  }

  visitCssStylesBlock(ast: ast.CssStylesBlockAst, context?: any): any {
    ast.definitions.forEach((definitionAst: ast.CssDefinitionAst) => {
      definitionAst.visit(this, context);
    });
  }

  visitCssStyleSheet(ast: ast.CssStyleSheetAst, context?: any): any {
    ast.rules.forEach((ruleAst: ast.CssRuleAst) => {
      ruleAst.visit(this, context);
    });
  }

  visitCssUnknownRule(ast: ast.CssUnknownRuleAst, context?: any): any {}

  visitCssUnknownTokenList(ast: ast.CssUnknownTokenListAst, context?: any): any {}
}
