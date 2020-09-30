import { expect } from 'chai';
import * as ts from 'typescript';
import * as Lint from 'tslint';

import { NgWalker } from '../../src/angular/ngWalker';
import { getDeclaredMethodNames, getDeclaredPropertyNames } from '../../src/util/classDeclarationUtils';
import { FlatSymbolTable } from '../../src/angular/templates/recursiveAngularExpressionVisitor';

describe('ngWalker', () => {
  it('should visit components and directives', () => {
    let source = `
      class Foobar {
        foo: number;
        bar() {}
        baz() {}
      }
    `;
    let ruleArgs: Lint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: [],
      ruleSeverity: 'warning',
    };
    let properties: FlatSymbolTable = {};
    let methods: FlatSymbolTable = {};

    class ClassUtilWalker extends NgWalker {
      visitClassDeclaration(node: ts.ClassDeclaration) {
        properties = getDeclaredPropertyNames(node);
        methods = getDeclaredMethodNames(node);
      }
    }

    let sf = ts.createSourceFile('foo', source, ts.ScriptTarget.ES5);
    let walker = new ClassUtilWalker(sf, ruleArgs);
    walker.walk(sf);
    expect(methods).to.deep.eq({ bar: true, baz: true });
    expect(properties).to.deep.eq({ foo: true });
  });
});
