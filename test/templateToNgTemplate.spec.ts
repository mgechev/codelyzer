import { assertSuccess, assertAnnotated, assertFailure } from './testHelper';
import { Fix, RuleFailure } from 'tslint';
import chai = require('chai');

describe('template-to-ng-template', () => {
  it('should skip elements with *-prefixed attr', () => {
    let source = `
      @Component({
        selector: 'foobar',
        template: '<section><div *ngIf="42"></div></section>'
      })
      class Test {}`;
      assertSuccess('template-to-ng-template', source);
  });

  it('should detect templete elements', () => {
    let source = `
      @Component({
        selector: 'foobar',
        template: '<section><template [ngForOf]></template></div>'
                            ~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}`;
      assertAnnotated({
        ruleName: 'template-to-ng-template',
        message: 'You should use <ng-template/> instead of <template/>',
        source
      });
  });

  it('should detect templete elements', () => {
    let source = `
      @Component({
        selector: 'foobar',
        template: '<section><template [ngForOf]><br></template></div>'
                            ~~~~~~~~~~~~~~~~~~~~
      })
      class Test {}`;
      assertAnnotated({
        ruleName: 'template-to-ng-template',
        message: 'You should use <ng-template/> instead of <template/>',
        source
      });
  });

  it('should detect templete elements', () => {
    let source = `
      @Component({
        selector: 'foobar',
        template: \`<section>
          <template [ngForOf]><div/>
          ~~~~~~~~~~~~~~~~~~~~
          </template></div>\`
      })
      class Test {}`;
      assertAnnotated({
        ruleName: 'template-to-ng-template',
        message: 'You should use <ng-template/> instead of <template/>',
        source
      });
  });

  describe('autofixes', () => {

    it('should not autofix template suggar', () => {
      let source = `
      @Component({
        selector: 'foobar',
        template: '<section><div *ngIf="42"></div></section>'
      })
      class Test {}`;
      assertSuccess('template-to-ng-template', source);
    });

    it('should fix template with no suggar', () => {
      let source = `
      @Component({
        selector: 'foobar',
        template: '<div></div><template></template><template></template>'
                              ~~~~~~~~~~
      })
      class Test {}`;
      const failures = assertAnnotated({
        ruleName: 'template-to-ng-template',
        source,
        message: 'You should use <ng-template/> instead of <template/>'
      });
      chai.expect(failures[0].hasFix()).to.eq(true);
      const fixes = [failures[0].getFix()].concat(failures[1].getFix());
      chai.expect(fixes[0].replacements.length).to.eq(2);
      const res = Fix.applyAll(source, fixes);
      const expected = `
      @Component({
        selector: 'foobar',
        template: '<div></div><ng-template></ng-template><ng-template></ng-template>'
                              ~~~~~~~~~~
      })
      class Test {}`;
      chai.expect(res).to.eq(expected);
    });

    it('should fix template with no suggar & nested templates', () => {
      let source = `
      @Component({
        selector: 'foobar',
        template: '<div></div><template><template></template></template>'
                              ~~~~~~~~~~
      })
      class Test {}`;
      const failures = assertAnnotated({
        ruleName: 'template-to-ng-template',
        source,
        message: 'You should use <ng-template/> instead of <template/>'
      });
      chai.expect(failures[0].hasFix()).to.eq(true);
      chai.expect((failures as RuleFailure[]).length).to.eq(2);
      const fixes = [failures[0].getFix()].concat(failures[1].getFix());
      chai.expect(fixes[0].replacements.length).to.eq(2);
      chai.expect(fixes[1].replacements.length).to.eq(2);
      const res = Fix.applyAll(source, fixes);
      const expected = `
      @Component({
        selector: 'foobar',
        template: '<div></div><ng-template><ng-template></ng-template></ng-template>'
                              ~~~~~~~~~~
      })
      class Test {}`;
      chai.expect(res).to.eq(expected);
    });

    it('should fix template with templates & suggar', () => {
      let source = `
      @Component({
        selector: 'foobar',
        template: \`
          <div *ngIf="bar"></div>
          <template>
          </template>\`
      })
      class Test {}`;
      const failures = assertFailure('template-to-ng-template', source, {
        message: 'You should use <ng-template/> instead of <template/>',
        startPosition: {
          line: 5,
          character: 10
        },
        endPosition: {
          line: 5,
          character: 20
        }
      });
      chai.expect(failures[0].hasFix()).to.eq(true);
      chai.expect((failures as RuleFailure[]).length).to.eq(1);
      const fixes = [failures[0].getFix()];
      const res = Fix.applyAll(source, fixes);
      const expected = `
      @Component({
        selector: 'foobar',
        template: \`
          <div *ngIf="bar"></div>
          <ng-template>
          </ng-template>\`
      })
      class Test {}`;
      chai.expect(res).to.eq(expected);
    });

    it('should fix template with no suggar & nested templates & nested elements', () => {
      let source = `
      @Component({
        selector: 'foobar',
        template: \`
          <template>
            <template>
              <div *ngIf="foo"></div>
            </template>
            <template>
              <div><span>
              </span></div>
            </template>
          </template>
        \`
      })
      class Test {}`;
      const failures = assertFailure('template-to-ng-template', source, {
        message: 'You should use <ng-template/> instead of <template/>',
        startPosition: {
          line: 4,
          character: 10
        },
        endPosition: {
          line: 4,
          character: 20
        }
      });
      chai.expect((failures as any).length).to.eq(3);
      chai.expect(failures[0].hasFix()).to.eq(true);
      const fixes = failures[0].getFix();
      chai.expect(fixes.replacements.length).to.eq(2);
      const res = Fix.applyAll(source, (failures as any).map(f => f.getFix()));
      const expected = `
      @Component({
        selector: 'foobar',
        template: \`
          <ng-template>
            <ng-template>
              <div *ngIf="foo"></div>
            </ng-template>
            <ng-template>
              <div><span>
              </span></div>
            </ng-template>
          </ng-template>
        \`
      })
      class Test {}`;
      chai.expect(res).to.eq(expected);
    });

    it('should fix template with no suggar & nested templates & nested elements', () => {
      let source = `
      @Component({
        selector: 'foobar',
        template: \`
          <template>
            <template></template>
          </template>
          <template></template>
        \`
      })
      class Test {}`;
      const failures = assertFailure('template-to-ng-template', source, {
        message: 'You should use <ng-template/> instead of <template/>',
        startPosition: {
          line: 4,
          character: 10
        },
        endPosition: {
          line: 4,
          character: 20
        }
      });
      chai.expect(failures[0].hasFix()).to.eq(true);
      const fixes = failures[0].getFix();
      chai.expect(fixes.replacements.length).to.eq(2);
      chai.expect(failures.length).to.eq(3);
      const reps = fixes.replacements;
      const res = Fix.applyAll(source, failures.map(f => f.getFix()));
      const expected = `
      @Component({
        selector: 'foobar',
        template: \`
          <ng-template>
            <ng-template></ng-template>
          </ng-template>
          <ng-template></ng-template>
        \`
      })
      class Test {}`;
      chai.expect(res).to.eq(expected);
    });

    it('should fix template with no suggar & nested templates & nested elements', () => {
      let source = `
      @Component({
        selector: 'foobar',
        template: \`
          <div *ngIf="foo">
            <template></template>
          </div>
        \`
      })
      class Test {}`;
      const failures = assertFailure('template-to-ng-template', source, {
        message: 'You should use <ng-template/> instead of <template/>',
        startPosition: {
          line: 5,
          character: 12
        },
        endPosition: {
          line: 5,
          character: 22
        }
      });
      chai.expect(failures[0].hasFix()).to.eq(true);
      const fixes = failures[0].getFix();
      chai.expect(fixes.replacements.length).to.eq(2);
      const reps = fixes.replacements;
      const res = fixes.apply(source);
      const expected = `
      @Component({
        selector: 'foobar',
        template: \`
          <div *ngIf="foo">
            <ng-template></ng-template>
          </div>
        \`
      })
      class Test {}`;
      chai.expect(res).to.eq(expected);
    });

  });

});
