import * as Lint from 'tslint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import {stringDistance} from './util/utils';
import {Ng2Walker} from './angular/ng2Walker';
import {RecursiveAngularExpressionVisitor} from './angular/templates/recursiveAngularExpressionVisitor';
import {ExpTypes} from './angular/expressionTypes';
import {getClassMembers} from './util/classDeclarationUtils';
import * as e from '@angular/compiler/src/expression_parser/ast';

import {Config} from './angular/config';

enum DeclarationType {
  Property,
  Method
};

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
    let available: string[];
    if (type === DeclarationType.Method) {
      symbolType = 'method';
    } else {
      symbolType = 'property';
    }

    const typeChecker = this.languageService.getProgram().getTypeChecker();

    available = getClassMembers(this.context.controller, typeChecker)
      .map(p => p.name)
      .concat(this.preDefinedVariables);

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

    if (available.indexOf(ast.name) < 0) {
      let failureString = sprintf.apply(this, [Rule.FAILURE, symbolType, ast.name]);
      if (ast.name) {
        const top = this.getTopSuggestion(available, ast.name);
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

export class Rule extends Lint.Rules.TypedRule {
  public static FAILURE: string = 'The %s "%s" that you\'re trying to access does not exist in the class declaration.';
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'no-access-missing-member',
    description: 'Prevents bindings to expressions containing non-existing methods or properties',
    optionsDescription: 'Not configurable',
    options: null,
    type: 'functionality',
    typescriptOnly: true
  };

  public applyWithProgram(sourceFile: ts.SourceFile, languageService: ts.LanguageService): Lint.RuleFailure[] {
    const sf = languageService.getProgram().getSourceFiles().filter(sf => sf.fileName === sourceFile.fileName).pop();
    return this.applyWithWalker(
        new Ng2Walker(sf,
            this.getOptions(), {
              expressionVisitorCtrl: SymbolAccessValidator,
              languageService
            }));
  }
}

