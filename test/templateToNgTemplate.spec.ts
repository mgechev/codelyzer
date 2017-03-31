import { assertSuccess, assertAnnotated, assertFailure } from './testHelper';
import chai = require('chai');

describe('templates-use-public', () => {
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
      })
      class Test {}`;
      const failures = assertFailure('template-to-ng-template', source, {
        message: 'You should use <ng-template/> instead of <template/>',
          startPosition: {
            line: 3,
            character: 30
          },
          endPosition: {
            line: 3,
            character: 40
          }
        });
      chai.expect(failures[0].hasFix()).to.eq(true);
      const fixes = failures[0].getFix();
      chai.expect(fixes.replacements.length).to.eq(4);
      const reps = fixes.replacements;
      chai.expect(reps[0].text).to.eq('<ng-template');
      chai.expect(reps[1].text).to.eq('</ng-template>');
      chai.expect(reps[2].text).to.eq('<ng-template');
      chai.expect(reps[3].text).to.eq('</ng-template>');
      chai.expect(reps[0].start).to.eq(78);
      chai.expect(reps[0].end).to.eq(87);
      chai.expect(reps[1].start).to.eq(88);
      chai.expect(reps[1].end).to.eq(99);
      chai.expect(reps[2].start).to.eq(99);
      chai.expect(reps[2].end).to.eq(108);
      chai.expect(reps[3].start).to.eq(109);
      chai.expect(reps[3].end).to.eq(120);
      const res = fixes.apply(source);
      const expected = `
      @Component({
        selector: 'foobar',
        template: '<div></div><ng-template></ng-template><ng-template></ng-template>'
      })
      class Test {}`;
      chai.expect(res).to.eq(expected);
    });

    it('should fix template with no suggar & nested templates', () => {
      let source = `
      @Component({
        selector: 'foobar',
        template: '<div></div><template><template></template></template>'
      })
      class Test {}`;
      const failures = assertFailure('template-to-ng-template', source, {
        message: 'You should use <ng-template/> instead of <template/>',
          startPosition: {
            line: 3,
            character: 30
          },
          endPosition: {
            line: 3,
            character: 40
          }
        });
      chai.expect(failures[0].hasFix()).to.eq(true);
      const fixes = failures[0].getFix();
      chai.expect(fixes.replacements.length).to.eq(4);
      const reps = fixes.replacements;
      const res = fixes.apply(source);
      const expected = `
      @Component({
        selector: 'foobar',
        template: '<div></div><ng-template><ng-template></ng-template></ng-template>'
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
      const fixes = failures[0].getFix();
      chai.expect(fixes.replacements.length).to.eq(2);
      const reps = fixes.replacements;
      const res = fixes.apply(source);
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
      chai.expect(failures[0].hasFix()).to.eq(true);
      const fixes = failures[0].getFix();
      chai.expect(fixes.replacements.length).to.eq(6);
      const reps = fixes.replacements;
      const res = fixes.apply(source);
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
      chai.expect(fixes.replacements.length).to.eq(6);
      const reps = fixes.replacements;
      const res = fixes.apply(source);
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
