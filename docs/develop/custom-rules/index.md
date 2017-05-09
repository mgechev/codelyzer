---
title: Developing codelyzer rules
layout: page
permalink: "/develop/custom-rules/"
---

Codelyzer uses tslint and the Angular template, expression and styles parser. In order to explore the basics of how you can develop rules which perform validation over your TypeScript code, visit tslint's [manual page](https://palantir.github.io/tslint/develop/custom-rules/).

In order to perform custom validation over templates, styles and template expressions, you can provide a custom visitors. Here's an example for how you can develop a custom rule for traversal of the styles of your components:

```ts
class ElementVisitor extends BasicTemplateAstVisitor {
  visitElement(ast: ElementAst, fn: any) {
    console.log('Visiting a template element!');
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    // Same metadata you'd declare for a tslint rule.
  };


  static FAILURE: string = 'Failure string';

  public apply(sourceFile:ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new TypeScriptVisitor(sourceFile,
            this.getOptions(), {
              cssVisitorCtrl: CssVisitor,
              templateVisitorCtrl: ElementVisitor,
              // expressionVisitorCtrl: ExpressionVisitorCtrlImpl
            }));
  }
}

class CssVisitor extends BasicCssAstVisitor {
  templateAst: TemplateAst;

  constructor(sourceFile: ts.SourceFile,
    originalOptions: Lint.IOptions,
    context: ComponentMetadata,
    protected style: StyleMetadata,
    templateStart: number) {
      super(sourceFile, originalOptions, context, style, templateStart);
    }

  visitCssSelectorRule(ast: CssSelectorRuleAst) {
    console.log('Visiting a CSS selector rule!');
  }

  visitCssSelector(ast: CssSelectorAst) {
    console.log('Visiting a CSS selector!');
  }
}

export class TypeScriptVisitor extends NgWalker {
  visitClassDeclaration(declaration: ts.ClassDeclaration) {
    console.log('Visiting a class declaration!');
  }
}
```

