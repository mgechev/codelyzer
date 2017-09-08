import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
import { stringDistance } from './util/utils';
import { NgWalker } from './angular/ngWalker';
import { RecursiveAngularExpressionVisitor, FlatSymbolTable } from './angular/templates/recursiveAngularExpressionVisitor';
import { ExpTypes } from './angular/expressionTypes';
import { getDeclaredMethodNames, getDeclaredPropertyNames } from './util/classDeclarationUtils';
import * as e from '@angular/compiler/src/expression_parser/ast';

import { Config } from './angular/config';

enum DeclarationType {
  Property,
  Method
}

export interface ASTField {
  obj?: ASTField;
  receiver?: ASTField;
  name?: string;
  span: e.ParseSpan;
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

  private doCheck(ast: ASTField, type: DeclarationType, context: any): any {
    let symbolType: string;
    let available: FlatSymbolTable;
    if (type === DeclarationType.Method) {
      symbolType = 'method';
    } else {
      symbolType = 'property';
    }

    available = Object.assign({},
      getDeclaredMethodNames(this.context.controller),
      getDeclaredPropertyNames(this.context.controller),
      this.preDefinedVariables
    );

    // Do not support nested properties yet
    let tmp = ast;
    while (tmp && !ExpTypes.ImplicitReceiver(tmp)) {
      ast = tmp;
      if (ExpTypes.KeyedRead(tmp)) {
        tmp = tmp.obj;
      } else if (ExpTypes.KeyedWrite(tmp)) {
        tmp = tmp.obj;
      } else if (ExpTypes.PropertyRead(tmp)) {
        tmp = tmp.receiver;
      } else if (ExpTypes.PropertyWrite(tmp)) {
        tmp = tmp.receiver;
      } else if (ExpTypes.SafeMethodCall(tmp)) {
        tmp = tmp.receiver;
      } else if (ExpTypes.SafePropertyRead(tmp)) {
        tmp = tmp.receiver;
      } else if (ExpTypes.MethodCall(tmp)) {
        tmp = tmp.receiver;
      } else {
        break;
      }
    }

    if (ast.name && !available[ast.name]) {
      let failureString = sprintf.apply(this, [Rule.FAILURE, symbolType, ast.name]);
      const top = this.getTopSuggestion(Object.keys(available), ast.name);
      const getSuggestion = (list: string[]) => {
        if (list.length === 1) {
          return `"${list[0]}"`;
        }
        let result = `"${list.shift()}"`;
        while (list.length > 1) {
          result += `, "${list.shift()}"`;
        }
        result += ` or "${list.shift()}"`;
        return result;
      };
      if (top.length && top[0].distance <= 2) {
        failureString += ` Probably you mean: ${getSuggestion(top.map(s => s.element))}.`;
      }
      const width = ast.name.length;
      this.addFailure(this.createFailure(ast.span.start, width, failureString));
    }
    return null;
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
    ruleName: 'no-access-missing-member',
    type: 'functionality',
    description: `Disallows using non-existing properties and methods from the component in templates.`,
    rationale: `Such occurances in code are most likely a result of a typo.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };

  static FAILURE: string = 'The %s "%s" that you\'re trying to access does not exist in the class declaration.';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new NgWalker(sourceFile,
            this.getOptions(), {
              expressionVisitorCtrl: SymbolAccessValidator
            }));
  }
}

