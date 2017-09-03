import * as ts from 'typescript';
import * as tslint from 'tslint';

import { NgWalker } from '../../src/angular/ngWalker';
import { BasicCssAstVisitor } from '../../src/angular/styles/basicCssAstVisitor';
import chai = require('chai');
import * as spies from 'chai-spies';

chai.use(spies);

const chaiSpy = (<any>chai).spy;

describe('basicCssAstVisitor', () => {

  it('should use the default css walker by default', () => {
    let source = `
      @Component({
        styles: [
          \`foo\`
        ]
      })
      class Baz {}
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null,
      ruleSeverity: 'warning'
    };
    let sf = ts.createSourceFile('foo', source, null);
    let walker = new NgWalker(sf, ruleArgs);
    (<any>chai).expect(() => {
      let templateSpy = chaiSpy.on(BasicCssAstVisitor.prototype, 'visitCssStyleSheet');
      walker.walk(sf);
      (<any>chai.expect(templateSpy).to.have.been).called();
    }).not.to.throw();
  });

  it('should visit the css selector', () => {
    let source = `
      @Component({
        styles: [
          \`
          .foo::before {}
          .baz bar {}
          \`
        ]
      })
      class Baz {}
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null,
      ruleSeverity: 'warning'
    };
    let sf = ts.createSourceFile('foo', source, null);
    let walker = new NgWalker(sf, ruleArgs);
    (<any>chai).expect(() => {
      let selectorSpy = chaiSpy.on(BasicCssAstVisitor.prototype, 'visitCssSelector');
      let pseudoSelectorSpy = chaiSpy.on(BasicCssAstVisitor.prototype, 'visitCssPseudoSelector');
      walker.walk(sf);
      (<any>chai.expect(selectorSpy).to.have.been).called();
      (<any>chai.expect(pseudoSelectorSpy).to.have.been).called();
    }).not.to.throw();
  });

});

