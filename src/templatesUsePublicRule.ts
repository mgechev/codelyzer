import * as Lint from 'tslint';
import * as ts from 'typescript';
import { stringDistance } from './util/utils';
import { getDeclaredProperties, getDeclaredMethods } from './util/classDeclarationUtils';
import { NgWalker } from './angular/ngWalker';
import { RecursiveAngularExpressionVisitor } from './angular/templates/recursiveAngularExpressionVisitor';
import * as e from '@angular/compiler/src/expression_parser/ast';
import SyntaxKind = require('./util/syntaxKind');

enum DeclarationType {
  Property,
  Method
}

class SymbolAccessValidator extends RecursiveAngularExpressionVisitor {
  visitPropertyRead(ast: e.PropertyRead, context: any): any {
    return this.doCheck(ast, DeclarationType.Property, context);
  }

  visitMethodCall(ast: e.MethodCall, context: any): any {
    this.doCheck(ast, DeclarationType.Method, context);
  }

  visitPropertyWrite(ast: e.PropertyWrite, context: any): any {
    this.doCheck(ast, DeclarationType.Property, context);
  }

  private doCheck(ast: e.MethodCall | e.PropertyRead | e.PropertyWrite, type: DeclarationType, context: any): any {
    // Do not support nested properties yet
    if (ast.receiver && ((<any>ast.receiver).name || (<any>ast.receiver).key)) {
      let receiver: any = ast.receiver;
      while (receiver.receiver.name) {
        receiver = receiver.receiver;
      }
      ast = <e.PropertyRead>receiver;
    }
    // We have the variable re-declared in the template
    // which makes it automatically public.
    if (this.preDefinedVariables[ast.name]) {
      return;
    }
    const allMembers = getDeclaredMethods(this.context.controller).concat(getDeclaredProperties(this.context.controller));
    const member = allMembers.filter((m: any) => m.name && m.name.text === ast.name).pop();
    if (member) {
      let isPublic = !member.modifiers || !member.modifiers
        .some(m => m.kind === SyntaxKind.current().PrivateKeyword || m.kind === SyntaxKind.current().ProtectedKeyword);
      const width = ast.name.length;
      if (!isPublic) {
        const failureString = `You can bind only to public class members. "${member.name.getText()}" is not a public class member.`;
        this.addFailure(this.createFailure(ast.span.start, width, failureString));
      }
    }
  }

  private getTopSuggestion(list: string[], current: string) {
    const result = [];
    const tmp = list.map(e => {
      return {
        element: e,
        distance: stringDistance(e, current)
      };
    }).sort((a, b) => a.distance - b.distance);
    const first = tmp.shift();
    if (!first) {
      return [];
    } else {
      result.push(first);
      let current: any;
      while (current = tmp.shift()) {
        if (current.distance !== first.distance) {
          return result;
        } else {
          result.push(current);
        }
      }
      return result;
    }
  }
}

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'templates-use-public',
    type: 'functionality',
    description: `Ensure that properties and methods accessed from the template are public.`,
    rationale: `When Angular compiles the templates, it has to access these properties from outside the class.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new NgWalker(sourceFile,
            this.getOptions(), {
              expressionVisitorCtrl: SymbolAccessValidator
            }));
  }
}

