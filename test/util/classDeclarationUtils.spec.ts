import * as ts from 'typescript';
import * as tslint from 'tslint/lib/lint';

import {Ng2Walker, RecursiveAngularExpressionVisitor} from '../../src/angular/ng2-walker';
import {getDeclaredMethodNames, getDeclaredPropertyNames} from '../../src/util/class-declaration-utils';
import chai = require('chai');

describe('ng2Walker', () => {
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
      disabledIntervals: null
    };
    let properties: string[] = [];
    let methods: string[] = [];

    class ClassUtilWalker extends Ng2Walker {
      visitClassDeclaration(node: ts.ClassDeclaration) {
        properties = getDeclaredPropertyNames(node);
        methods = getDeclaredMethodNames(node);
      }
    }

    let sf = ts.createSourceFile('foo', source, null);
    let walker = new ClassUtilWalker(sf, ruleArgs);
    walker.walk(sf);
    (<any>chai.expect(methods.join())).to.equal(['bar', 'baz'].join());
    (<any>chai.expect(properties.join())).to.equal(['foo'].join());
  });
});

