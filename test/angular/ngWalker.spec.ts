import * as ts from 'typescript';
import * as Lint from 'tslint';

import { NgWalker } from '../../src/angular/ngWalker';
import { RecursiveAngularExpressionVisitor } from '../../src/angular/templates/recursiveAngularExpressionVisitor';
import { BasicTemplateAstVisitor } from '../../src/angular/templates/basicTemplateAstVisitor';
import { BasicCssAstVisitor } from '../../src/angular/styles/basicCssAstVisitor';
import chai = require('chai');
import * as spies from 'chai-spies';

chai.use(spies);

const chaiSpy = (chai as any).spy;

describe('ngWalker', () => {
  it('should visit components, directives, pipes, injectables, and modules', () => {
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
      @Pipe({
        name: 'foo'
      })
      class FooPipe {}
      @NgModule({})
      class BarModule {}
      @Injectable()
      class FooService {}
    `;
    let ruleArgs: Lint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: [],
      ruleSeverity: 'warning',
    };
    let sf = ts.createSourceFile('foo', source, ts.ScriptTarget.ES5);
    let walker = new NgWalker(sf, ruleArgs);
    let cmpSpy = chaiSpy.on(walker, 'visitNgComponent');
    let dirSpy = chaiSpy.on(walker, 'visitNgDirective');
    let pipeSpy = chaiSpy.on(walker, 'visitNgPipe');
    let modSpy = chaiSpy.on(walker, 'visitNgModule');
    let injSpy = chaiSpy.on(walker, 'visitNgInjectable');
    walker.walk(sf);
    (chai.expect(cmpSpy).to.have.been as any).called();
    (chai.expect(dirSpy).to.have.been as any).called();
    (chai.expect(pipeSpy).to.have.been as any).called();
    (chai.expect(modSpy).to.have.been as any).called();
    (chai.expect(injSpy).to.have.been as any).called();
  });

  it('should not visit components, directives, pipes, injectables, and modules', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: 'bar'
      })
      export default class {}
      @Directive({
        selector: '[baz]'
      })
      export default class {}
      @Pipe({
        name: 'foo'
      })
      export default class {}
      @NgModule({})
      export default class {}
      @Injectable()
      export default class {}
    `;
    let ruleArgs: Lint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: [],
      ruleSeverity: 'warning',
    };
    let sf = ts.createSourceFile('foo', source, ts.ScriptTarget.ES5);
    let walker = new NgWalker(sf, ruleArgs);
    let cmpSpy = chaiSpy.on(walker, 'visitNgComponent');
    let dirSpy = chaiSpy.on(walker, 'visitNgDirective');
    let pipeSpy = chaiSpy.on(walker, 'visitNgPipe');
    let modSpy = chaiSpy.on(walker, 'visitNgModule');
    let injSpy = chaiSpy.on(walker, 'visitNgInjectable');
    walker.walk(sf);
    (chai.expect(cmpSpy).to.not.have.been as any).called();
    (chai.expect(dirSpy).to.not.have.been as any).called();
    (chai.expect(pipeSpy).to.not.have.been as any).called();
    (chai.expect(modSpy).to.not.have.been as any).called();
    (chai.expect(injSpy).to.not.have.been as any).called();
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
    let ruleArgs: Lint.IOptions = {
      ruleName: 'foo',
      ruleArguments: ['foo'],
      disabledIntervals: [],
      ruleSeverity: 'warning',
    };
    let sf = ts.createSourceFile('foo', source, ts.ScriptTarget.ES5);
    let walker = new NgWalker(sf, ruleArgs);
    let outputsSpy = chaiSpy.on(walker, 'visitNgOutput');
    let inputsSpy = chaiSpy.on(walker, 'visitNgInput');
    walker.walk(sf);
    (chai.expect(outputsSpy).to.have.been as any).called();
    (chai.expect(inputsSpy).to.have.been as any).called();
  });

  it('should visit component templates', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: '<div></div>'
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
    let walker = new NgWalker(sf, ruleArgs, {
      templateVisitorCtrl: BasicTemplateAstVisitor,
    });
    let templateSpy = chaiSpy.on(BasicTemplateAstVisitor.prototype, 'visitElement');
    walker.walk(sf);
    (chai.expect(templateSpy).to.have.been as any).called();
  });

  it('should visit component template expressions', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: '{{foo}}'
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
    let templateSpy = chaiSpy.on(RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
    walker.walk(sf);
    (chai.expect(templateSpy).to.have.been as any).called();
  });

  it('should not thow when a template is not literal', () => {
    let source = `
      const template = '{{foo}}';
      @Component({
        selector: 'foo',
        template: template
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
        let templateSpy = chaiSpy.on(RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
        walker.walk(sf);
        (chai.expect(templateSpy).to.not.have.been as any).called();
      })
      .not.to.throw();
  });

  it('should not thow when a template is dynamically injected', () => {
    let source = `
      const template = '{{foo}}';
      @Component({
        selector: 'foo',
        template: require('template') as string
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
        let templateSpy = chaiSpy.on(RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
        walker.walk(sf);
        (chai.expect(templateSpy).to.not.have.been as any).called();
      })
      .not.to.throw();
  });

  it('should not thow when a template is template string', () => {
    let source = `
      const template = '{{foo}}';
      @Component({
        selector: 'foo',
        template: \`foo \${test}\`
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
        let templateSpy = chaiSpy.on(RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
        walker.walk(sf);
        (chai.expect(templateSpy).to.not.have.been as any).called();
      })
      .not.to.throw();
  });

  it('should ignore templateUrl', () => {
    let source = `
      @Component({
        selector: 'foo',
        templateUrl: 'test.html'
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
        let templateSpy = chaiSpy.on(RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
        walker.walk(sf);
        (chai.expect(templateSpy).to.not.have.been as any).called();
      })
      .not.to.throw();
  });

  it('should ignore empty @Component decorator', () => {
    let source = `
      @Component()
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
        let templateSpy = chaiSpy.on(RecursiveAngularExpressionVisitor.prototype, 'visitPropertyRead');
        walker.walk(sf);
        (chai.expect(templateSpy).to.not.have.been as any).called();
      })
      .not.to.throw();
  });

  it('should ignore non-invoked @Component decorator', () => {
    let source = `
      @Component
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
        walker.walk(sf);
      })
      .not.to.throw();
  });

  describe('inline styles', () => {
    it('should not throw when there are inline styles', () => {
      let source = `
        @Component({
          styles: [
            \`foo\`
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
          walker.walk(sf);
        })
        .not.to.throw();
    });

    it('should use the default css walker by default', () => {
      let source = `
        @Component({
          styles: [
            \`foo\`
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

    it('should not break', () => {
      let source = `
        export class Main {

          constructor() {

          }

          regExp() {
            // complaining about missing whitespace after coma in regex
            const test = /\${0,1}/.test('not important$');
            console.log(test);
          }

          stringLiteral() {
            const offset = "3";
            // complaining about missing whitespace inside of string literal
            const test = \`<path d="M\${offset},\${offset}">\`;
            console.log(test);
          }
        }

        // compains about missing semicolon at end
        export class WantsSemiColonAtEndOfClass {
          constructor() {

          }
        }
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
          walker.walk(sf);
        })
        .not.to.throw();
    });
  });
});
