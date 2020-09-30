import * as ts from 'typescript';
import * as Lint from 'tslint';

import { NgWalker } from '../../src/angular/ngWalker';
import { BasicCssAstVisitor } from '../../src/angular/styles/basicCssAstVisitor';
import chai = require('chai');
import * as spies from 'chai-spies';

chai.use(spies);

const chaiSpy = (chai as any).spy;

describe('basicCssAstVisitor', () => {
  it('should use the default css walker by default', () => {
    let source = `
      @Component({
        styles: [
          'foo'
        ]
      })
      class Baz {}
    `;
    let ruleArgs: Lint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: [],
      ruleSeverity: 'warning',
    };
    let sf = ts.createSourceFile('foo', source, ts.ScriptTarget.ES5);
    let walker = new NgWalker(sf, ruleArgs);
    chai
      .expect(() => {
        let templateSpy = chaiSpy.on(BasicCssAstVisitor.prototype, 'visitCssStyleSheet');
        walker.walk(sf);
        (chai.expect(templateSpy).to.have.been as any).called();
      })
      .not.to.throw();
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
    let ruleArgs: Lint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: [],
      ruleSeverity: 'warning',
    };
    let sf = ts.createSourceFile('foo', source, ts.ScriptTarget.ES5);
    let walker = new NgWalker(sf, ruleArgs);
    chai
      .expect(() => {
        let selectorSpy = chaiSpy.on(BasicCssAstVisitor.prototype, 'visitCssSelector');
        let pseudoSelectorSpy = chaiSpy.on(BasicCssAstVisitor.prototype, 'visitCssPseudoSelector');
        walker.walk(sf);
        (chai.expect(selectorSpy).to.have.been as any).called();
        (chai.expect(pseudoSelectorSpy).to.have.been as any).called();
      })
      .not.to.throw();
  });
});
