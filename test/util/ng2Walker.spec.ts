import * as ts from 'typescript';
import * as tslint from 'tslint/lib/lint';

import {Ng2Walker} from '../../src/util/ng2Walker';
import chai = require('chai');
import * as spies from 'chai-spies';

chai.use(spies);

const chaiSpy = (<any>chai).spy;
describe('ng2Walker', () => {
  it('should visit components and directives', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: 'bar'
      })
      class Baz {}
      @Directive({
        selector: '[baz]'
      })
      class Foobar {}
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null
    };
    let sf = ts.createSourceFile('foo', source, null);
    let walker = new Ng2Walker(sf, ruleArgs);
    let cmpSpy = chaiSpy.on(walker, 'visitNg2Component');
    let dirSpy = chaiSpy.on(walker, 'visitNg2Directive');
    walker.walk(sf);
    (<any>chai.expect(cmpSpy).to.have.been).called();
    (<any>chai.expect(dirSpy).to.have.been).called();
  });
  it('should visit inputs and outputs with args', () => {
    let source = `
      @Component({
        selector: 'foo',
      })
      class Baz {
        @Input('bar')
        foo;
        @Output('baz')
        foobar;
      }
    `;
    let ruleArgs: tslint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: null
    };
    let sf = ts.createSourceFile('foo', source, null);
    let walker = new Ng2Walker(sf, ruleArgs);
    let outputsSpy = chaiSpy.on(walker, 'visitNg2Output');
    let inputsSpy = chaiSpy.on(walker, 'visitNg2Input');
    walker.walk(sf);
    (<any>chai.expect(outputsSpy).to.have.been).called();
    (<any>chai.expect(inputsSpy).to.have.been).called();
  });
});
