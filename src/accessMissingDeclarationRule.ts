import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import { stringDistance } from './util/utils';
import {Ng2Walker} from './angular/ng2Walker';
import {RecursiveAngularExpressionVisitor} from './angular/recursiveAngularExpressionVisitor';
import {getDeclaredMethodNames, getDeclaredPropertyNames} from './util/classDeclarationUtils';
import * as e from '@angular/compiler/src/expression_parser/ast';

enum DeclarationType {
  Property,
  Method
};

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
    let symbolType: string;
    let available: string[];
    if (type === DeclarationType.Method) {
      symbolType = 'method';
      available = getDeclaredMethodNames(this.context);
    } else {
      symbolType = 'property';
      available = getDeclaredPropertyNames(this.context);
    }
    ast.receiver.visit(this);
    if (available.indexOf(ast.name) < 0) {
      const top = this.getTopSuggestion(available, ast.name);
      let failureString = sprintf.apply(this, [Rule.FAILURE, symbolType, ast.name]);
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
      this.addFailure(this.createFailure(this.basePosition + ast.span.start, width, failureString));
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
  static FAILURE: string = 'The %s "%s" that you\'re trying to access does not exist in the class declaration.';

  public apply(sourceFile:ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
        new Ng2Walker(sourceFile,
            this.getOptions(),
            SymbolAccessValidator));
  }
}

