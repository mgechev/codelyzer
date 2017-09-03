import * as ts from 'typescript';
import * as tslint from 'tslint';

import { NgWalker } from '../../src/angular/ngWalker';
import { getDeclaredMethodNames, getDeclaredPropertyNames } from '../../src/util/classDeclarationUtils';
import { FlatSymbolTable } from '../../src/angular/templates/recursiveAngularExpressionVisitor';
import chai = require('chai');

describe('ngWalker', () => {
  it('should visit components and directives', () => {
    let source = `
      class Foobar {
        foo: number;
        bar() {}
        baz() {}
      }
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null,
      ruleSeverity: 'warning'
    };
    let properties: FlatSymbolTable = {};
    let methods: FlatSymbolTable = {};

    class ClassUtilWalker extends NgWalker {
      visitClassDeclaration(node: ts.ClassDeclaration) {
        properties = getDeclaredPropertyNames(node);
        methods = getDeclaredMethodNames(node);
      }
    }

    let sf = ts.createSourceFile('foo', source, null);
    let walker = new ClassUtilWalker(sf, ruleArgs);
    walker.walk(sf);
    chai.expect(methods).to.deep.eq({ bar: true, baz: true });
    chai.expect(properties).to.deep.eq({ foo: true });
  });
});
