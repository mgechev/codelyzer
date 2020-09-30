import { assertSuccess, assertAnnotated, assertMultipleAnnotated } from './testHelper';
import { Replacement } from 'tslint';
import { expect } from 'chai';
import * as ts from 'typescript';

const getAst = (code: string, file = 'file.ts') => {
  return ts.createSourceFile(file, code, ts.ScriptTarget.ES5, true);
};

describe('angular-whitespace', () => {
  describe('success', () => {
    describe('interpolation check', () => {
      it('should work with proper style', () => {
        let source = `
          @Component({
            template: \`
              <div>{{ foo }}</div>
            \`
          })
          class Bar {}
        `;
        assertSuccess('angular-whitespace', source, ['check-interpolation']);
      });

      it('should work with properties', () => {
        let source = `
          @Component({
            template: \`
              <input [value]="  {{ foo }}">
            \`
          })
          class Bar {}
        `;
        assertSuccess('angular-whitespace', source, ['check-interpolation']);
      });
    });

    describe('pipe check', () => {
      it('should succeed with proper style', () => {
        let source = `
          @Component({
            selector: 'foo',
            template: \`
              <div>{{ foo | async }}</div>
            \`
          })
          class Bar {
            foo: any;
          }
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });

      it('should succeed with in structural directives', () => {
        let source = `
          @Component({
            selector: 'foo',
            template: \`
              <div *ngIf="foo | async"></div>
            \`
          })
          class Bar {
            foo: any;
          }
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });

      it('should succeed with proper style', () => {
        let source = `
          @Component({
            selector: 'foo',
            template: \`
              <div>{{ foo | async | uppercase }}</div>
            \`
          })
          class Bar {
            foo: any;
          }
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });

      it('should work with proper style and complex expressions', () => {
        let source = `
          @Component({
            template: \`
              <div>{{ foo + bar | pipe }}</div>
            \`
          })
          class Bar {}
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });

      it('should work with proper style and complex expressions', () => {
        let source = `
          @Component({
            template: \`
              <div>{{ foo + 1 | pipe }}</div>
            \`
          })
          class Bar {}
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });

      it('should work with external templates', () => {
        const code = `
          @Component({
            selector: 'foo',
            moduleId: module.id,
            templateUrl: 'valid.html',
          })
          class Bar {}
        `;
        const ast = getAst(code, __dirname + '/../../test/fixtures/angularWhitespace/component.ts');
        assertSuccess('angular-whitespace', ast, ['check-pipe']);
      });

      it('should succeed with ngFor', () => {
        let source = `
          @Component({
            selector: 'foo',
            template: \`
              <span *ngFor="let pony of ponies | slice:0:1">{{ pony }}</span>
            \`
          })
          class Bar {
            ponies = [];
          }
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });

      it('should also work with ngFor', () => {
        const source = `
          @Component({
            selector: 'foo',
            moduleId: module.id,
            template: \`
              <div *ngFor="let pony of ponies | slice:0:4">
                <h2>{{ pony.name }}</h2>
              </div>
            \`
          })
          class Bar {
            ponies = []
          }
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });

      it('should work with external templates with ngFor', () => {
        const code = `
          @Component({
            selector: 'foo',
            moduleId: module.id,
            templateUrl: 'ngFor.html',
          })
          class Bar {
            ponies = []
          }
        `;
        const ast = getAst(code, __dirname + '/../../test/fixtures/angularWhitespace/component.ts');
        assertSuccess('angular-whitespace', ast, ['check-pipe']);
      });

      it('should work with ngIf else', () => {
        const source = `
          @Component({
            selector: 'foo',
            moduleId: module.id,
            template: \`
              <div *ngIf="isOnline | async; else offline">
                <h2>hello</h2>
              </div>
            \`
          })
          class Bar {
            ponies = []
          }
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });

      it('should succeed with i18n and description', () => {
        let source = `
          @Component({
            selector: 'foo',
            template: \`
              <h1 i18n="site header|An introduction header for this sample">Hello i18n!</h1>
            \`
          })
          class Bar {}
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });

      it('should succeed with expression surrounded by parentheses', () => {
        let source = `
          @Component({
            selector: 'foo',
            template: \`
              <p *ngIf="(items | async)" class="mat-caption"></p>
            \`
          })
          class Bar {}
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });

      it('should succeed with expression surrounded by lot of parentheses', () => {
        let source = `
          @Component({
            selector: 'foo',
            template: \`
              <p *ngIf="(((items) | async) | uppercase)" class="mat-caption"></p>
            \`
          })
          class Bar {}
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });

      it('should succeed with *ngIf and else condition', () => {
        let source = `
          @Component({
            selector: 'foo',
            template: \`
              <div *ngIf="countingPoints$ | async as countingPoints; else countingPoinsAreLoading">
                {{countingPoints}}
              </div>
              <ng-template #countingPoinsAreLoading>loading</ng-template>
            \`
          })
          class Bar {}
        `;
        assertSuccess('angular-whitespace', source, ['check-pipe']);
      });
    });

    describe('check-semicolon', () => {
      it('should work with proper style', () => {
        let source = `
          @Component({
            template: '<div *ngIf="codelyzer|async; else awesome;"></div>'
          })
          class Bar {}
        `;
        assertSuccess('angular-whitespace', source, ['check-semicolon']);
      });

      it('should work with proper style also', () => {
        let source = `
          @Component({
            template: '<div *ngIf="date | date:'mm;ss'; fails"></div>'
          })
          class Bar {}
        `;
        assertSuccess('angular-whitespace', source, ['check-semicolon']);
      });

      it('should work with proper style of multiple semicolons', () => {
        let source = `
          @Component({
            template: \`
              <div *ngIf='date | date:"fullDate"; let dateString; else errorDate;'>{{ dateString }}</div>
              <ng-template #errorDate>error date!</ng-template>
            \`
          })
          class Bar {}
        `;
        assertSuccess('angular-whitespace', source, ['check-semicolon']);
      });
    });
  });
});

describe('failure', () => {
  describe('interpolation', () => {
    it('should fail when no space', () => {
      let source = `
        @Component({
          template: \`
            <div>{{foo}}</div>
                 ~~   ^^
          \`
        })
        class Bar {}
      `;
      assertMultipleAnnotated({
        ruleName: 'angular-whitespace',
        failures: [
          { char: '~', msg: 'Missing whitespace in interpolation start; expecting {{ expr }}' },
          { char: '^', msg: 'Missing whitespace in interpolation end; expecting {{ expr }}' },
        ],
        source,
        options: ['check-interpolation'],
      });
    });

    it('should fail when no space', () => {
      let source = `
        @Component({
          template: \`
            <div>{{foo }}</div>
                 ~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'angular-whitespace',
        message: 'Missing whitespace in interpolation start; expecting {{ expr }}',
        source,
        options: ['check-interpolation'],
      });
    });

    describe('replacements', () => {
      it('should fail and apply proper replacements when style is incorrect', () => {
        let source = `
          @Component({
            template: \`
              <div>  {{foo}}   </div>
                     ~~   ^^
            \`
          })
          class Bar {}
        `;
        const failures = assertMultipleAnnotated({
          ruleName: 'angular-whitespace',
          failures: [
            { char: '~', msg: 'Missing whitespace in interpolation start; expecting {{ expr }}' },
            { char: '^', msg: 'Missing whitespace in interpolation end; expecting {{ expr }}' },
          ],
          source,
          options: ['check-interpolation'],
        });
        const replacement = Replacement.applyFixes(
          source,
          failures.map((f) => f.getFix()!)
        );

        expect(replacement).to.eq(`
          @Component({
            template: \`
              <div>  {{ foo }}   </div>
                     ~~   ^^
            \`
          })
          class Bar {}
        `);
      });

      it('should fail and apply proper replacements when style is incorrect', () => {
        let source = `
          @Component({
            template: \`
              <div>
              some additional text
                {{foo}}
                ~~   ^^
              </div>
            \`
          })
          class Bar {}
        `;
        const failures = assertMultipleAnnotated({
          ruleName: 'angular-whitespace',
          failures: [
            { char: '~', msg: 'Missing whitespace in interpolation start; expecting {{ expr }}' },
            { char: '^', msg: 'Missing whitespace in interpolation end; expecting {{ expr }}' },
          ],
          source,
          options: ['check-interpolation'],
        });
        const replacement = Replacement.applyFixes(
          source,
          failures.map((f) => f.getFix()!)
        );

        expect(replacement).to.eq(`
          @Component({
            template: \`
              <div>
              some additional text
                {{ foo }}
                ~~   ^^
              </div>
            \`
          })
          class Bar {}
        `);
      });

      it('should fail and apply proper replacements when style is incorrect with multiple failures', () => {
        let source = `
          @Component({
            template: \`
              <div>
              some additional text
                {{foo}}
                ~~   --
                some other text
                {{  bar  }}
                ^^^^   ####
              </div>
            \`
          })
          class Bar {}
        `;
        const failures = assertMultipleAnnotated({
          ruleName: 'angular-whitespace',
          failures: [
            { char: '~', msg: 'Missing whitespace in interpolation start; expecting {{ expr }}' },
            { char: '-', msg: 'Missing whitespace in interpolation end; expecting {{ expr }}' },
            { char: '^', msg: 'Extra whitespace in interpolation start; expecting {{ expr }}' },
            { char: '#', msg: 'Extra whitespace in interpolation end; expecting {{ expr }}' },
          ],
          source,
          options: ['check-interpolation'],
        });
        const replacement = Replacement.applyFixes(
          source,
          failures.map((f) => f.getFix()!)
        );

        expect(replacement).to.eq(`
          @Component({
            template: \`
              <div>
              some additional text
                {{ foo }}
                ~~   --
                some other text
                {{ bar }}
                ^^^^   ####
              </div>
            \`
          })
          class Bar {}
        `);
      });

      it('should fail and apply proper replacements when style is incorrect', () => {
        let source = `
          @Component({
            template: \`
              <div>  {{foo }}   </div>
                     ~~
            \`
          })
          class Bar {}
        `;
        const failures = assertAnnotated({
          ruleName: 'angular-whitespace',
          message: 'Missing whitespace in interpolation start; expecting {{ expr }}',
          source,
          options: ['check-interpolation'],
        });

        if (!Array.isArray(failures)) return;

        const replacement = Replacement.applyFixes(
          source,
          failures.map((f) => f.getFix()!)
        );

        expect(replacement).to.eq(`
          @Component({
            template: \`
              <div>  {{ foo }}   </div>
                     ~~
            \`
          })
          class Bar {}
        `);
      });

      it('should remove extra spaces', () => {
        let source = `
          @Component({
            template: \`
              <div>{{  foo    }}</div>
                   ~~~~   ^^^^^^
            \`
          })
          class Bar {}
        `;
        const failures = assertMultipleAnnotated({
          ruleName: 'angular-whitespace',
          failures: [
            { char: '~', msg: 'Extra whitespace in interpolation start; expecting {{ expr }}' },
            { char: '^', msg: 'Extra whitespace in interpolation end; expecting {{ expr }}' },
          ],
          source,
          options: ['check-interpolation'],
        });
        const replacement = Replacement.applyFixes(
          source,
          failures.map((f) => f.getFix()!)
        );

        expect(replacement).to.eq(`
          @Component({
            template: \`
              <div>{{ foo }}</div>
                   ~~~~   ^^^^^^
            \`
          })
          class Bar {}
        `);
      });
    });
  });

  describe('check-semicolon', () => {
    it('should fail when no space after semicolon', () => {
      let source = `
        @Component({
          template: \` <div *ngIf="codelyzer;awesome"></div>
                                            ~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'angular-whitespace',
        message: "Missing whitespace after semicolon; expecting '; expr'",
        source,
        options: ['check-semicolon'],
      });
    });

    it('should fail when no space after semicolon', () => {
      let source = `
        @Component({
          template: \` <md-icon *ngIf="isOnline | async;else offline">cloud_off</md-icon>
                                                       ~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'angular-whitespace',
        message: "Missing whitespace after semicolon; expecting '; expr'",
        source,
        options: ['check-semicolon'],
      });
    });

    it('should fail when no space after semicolon', () => {
      let source = `
        @Component({
          template: \`  <div *ngIf="date | date:'mm;ss';fails"></div>
                                                       ~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'angular-whitespace',
        message: "Missing whitespace after semicolon; expecting '; expr'",
        source,
        options: ['check-semicolon'],
      });
    });

    it('should fail when no space after semicolon', () => {
      let source = `
        @Component({
          template: \`  <div *ngIf='date | date:"mm;ss";fails'></div>
                                                       ~~
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        ruleName: 'angular-whitespace',
        message: "Missing whitespace after semicolon; expecting '; expr'",
        source,
        options: ['check-semicolon'],
      });
    });

    describe('replacements', () => {
      it('should fail when no space after semicolon', () => {
        let source = `
          @Component({
            template: \` <div *ngIf="codelyzer;awesome"></div>
                                              ~~
            \`
          })
          class Bar {}
        `;
        const failures = assertAnnotated({
          ruleName: 'angular-whitespace',
          message: "Missing whitespace after semicolon; expecting '; expr'",
          source,
          options: ['check-semicolon'],
        });

        if (!Array.isArray(failures)) return;

        const replacement = Replacement.applyFixes(
          source,
          failures.map((f) => f.getFix()!)
        );

        expect(replacement).to.eq(`
          @Component({
            template: \` <div *ngIf="codelyzer; awesome"></div>
                                              ~~
            \`
          })
          class Bar {}
        `);
      });

      it('should fail when no space after semicolon', () => {
        let source = `
          @Component({
            template: \` <div *ngIf="date | date:'mm;ss';fails"></div>
                                                        ~~
            \`
          })
          class Bar {}
        `;
        const failures = assertAnnotated({
          ruleName: 'angular-whitespace',
          message: "Missing whitespace after semicolon; expecting '; expr'",
          source,
          options: ['check-semicolon'],
        });

        if (!Array.isArray(failures)) return;

        const replacement = Replacement.applyFixes(
          source,
          failures.map((f) => f.getFix()!)
        );

        expect(replacement).to.eq(`
          @Component({
            template: \` <div *ngIf="date | date:'mm;ss'; fails"></div>
                                                        ~~
            \`
          })
          class Bar {}
        `);
      });

      it('should fail and apply proper replacement when equality sign exists within the directive expression', () => {
        let source = `
          @Component({
            template: \` <div *ngFor="let item of list;trackBy trackById; let $index=index">{{ item.title }}</div>
                                                      ~~
            \`
          })
          class Bar {}
        `;
        const failures = assertAnnotated({
          ruleName: 'angular-whitespace',
          message: "Missing whitespace after semicolon; expecting '; expr'",
          source,
          options: ['check-semicolon'],
        });

        if (!Array.isArray(failures)) return;

        const replacement = Replacement.applyFixes(
          source,
          failures.map((f) => f.getFix()!)
        );

        expect(replacement).to.eq(`
          @Component({
            template: \` <div *ngFor="let item of list; trackBy trackById; let $index=index">{{ item.title }}</div>
                                                      ~~
            \`
          })
          class Bar {}
        `);
      });

      it('should fail and apply proper replacements with multiple failures of semicolon inside double quote', () => {
        let source = `
          @Component({
            template: \` <div *ngIf="date | date:'fullDate';let dateString;else errorDate">{{ dateString }}</div>
                                                           ~~             ^^
              <ng-template #errorDate>error date!</ng-template>
            \`
          })
          class Bar {}
        `;
        const failures = assertMultipleAnnotated({
          ruleName: 'angular-whitespace',
          failures: [
            { char: '~', msg: "Missing whitespace after semicolon; expecting '; expr'" },
            { char: '^', msg: "Missing whitespace after semicolon; expecting '; expr'" },
          ],
          source,
          options: ['check-semicolon'],
        });
        const replacement = Replacement.applyFixes(
          source,
          failures.map((f) => f.getFix()!)
        );

        expect(replacement).to.eq(`
          @Component({
            template: \` <div *ngIf="date | date:'fullDate'; let dateString; else errorDate">{{ dateString }}</div>
                                                           ~~             ^^
              <ng-template #errorDate>error date!</ng-template>
            \`
          })
          class Bar {}
        `);
      });

      it('should fail and apply proper replacements with multiple failures of semicolon inside single quote', () => {
        let source = `
          @Component({
            template: \` <div *ngIf='date | date:"fullDate";let dateString;else errorDate'>{{ dateString }}</div>
                                                           ~~             ^^
              <ng-template #errorDate>error date!</ng-template>
            \`
          })
          class Bar {}
        `;
        const failures = assertMultipleAnnotated({
          ruleName: 'angular-whitespace',
          failures: [
            { char: '~', msg: "Missing whitespace after semicolon; expecting '; expr'" },
            { char: '^', msg: "Missing whitespace after semicolon; expecting '; expr'" },
          ],
          source,
          options: ['check-semicolon'],
        });

        const replacement = Replacement.applyFixes(
          source,
          failures.map((f) => f.getFix()!)
        );

        expect(replacement).to.eq(`
          @Component({
            template: \` <div *ngIf='date | date:"fullDate"; let dateString; else errorDate'>{{ dateString }}</div>
                                                           ~~             ^^
              <ng-template #errorDate>error date!</ng-template>
            \`
          })
          class Bar {}
        `);
      });

      it('should fail and apply proper replacement with single failure of multiple semicolons inside double quote', () => {
        let source = `
          @Component({
            template: \` <div *ngIf="date | date:'fullDate'; let dateString;else errorDate;">{{ dateString }}</div>
                                                                           ~~
              <ng-template #errorDate>error date!</ng-template>
            \`
          })
          class Bar {}
        `;
        const failures = assertAnnotated({
          ruleName: 'angular-whitespace',
          message: "Missing whitespace after semicolon; expecting '; expr'",
          source,
          options: ['check-semicolon'],
        });

        if (!Array.isArray(failures)) return;

        const replacement = Replacement.applyFixes(
          source,
          failures.map((f) => f.getFix()!)
        );

        expect(replacement).to.eq(`
          @Component({
            template: \` <div *ngIf="date | date:'fullDate'; let dateString; else errorDate;">{{ dateString }}</div>
                                                                           ~~
              <ng-template #errorDate>error date!</ng-template>
            \`
          })
          class Bar {}
        `);
      });

      it('should fail and apply proper replacement with single failure of multiple semicolons inside single quote', () => {
        let source = `
          @Component({
            template: \` <div *ngIf='date | date:"fullDate"; let dateString;else errorDate;'>{{ dateString }}</div>
                                                                           ~~
              <ng-template #errorDate>error date!</ng-template>
            \`
          })
          class Bar {}
        `;
        const failures = assertAnnotated({
          ruleName: 'angular-whitespace',
          message: "Missing whitespace after semicolon; expecting '; expr'",
          source,
          options: ['check-semicolon'],
        });

        if (!Array.isArray(failures)) return;

        const replacement = Replacement.applyFixes(
          source,
          failures.map((f) => f.getFix()!)
        );

        expect(replacement).to.eq(`
          @Component({
            template: \` <div *ngIf='date | date:"fullDate"; let dateString; else errorDate;'>{{ dateString }}</div>
                                                                           ~~
              <ng-template #errorDate>error date!</ng-template>
            \`
          })
          class Bar {}
        `);
      });
    });
  });
});

describe('pipes', () => {
  it('should fail when extra space after "|"', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo |  async }}</div>
                     ~~~
        \`
      })
      class Bar {
        foo: any;
      }
    `;
    const failures = assertAnnotated({
      ruleName: 'angular-whitespace',
      message: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".',
      source,
      options: ['check-pipe'],
    });

    if (!Array.isArray(failures)) return;

    const replacement = Replacement.applyFixes(
      source,
      failures.map((f) => f.getFix()!)
    );

    expect(replacement).to.eq(`
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo | async }}</div>
                     ~~~
        \`
      })
      class Bar {
        foo: any;
      }
    `);
  });

  it('should fail when extra space on both sides', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo  |  async }}</div>
                      ~~~
        \`
      })
      class Bar {
        foo: any;
      }
    `;
    const failures = assertAnnotated({
      ruleName: 'angular-whitespace',
      message: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".',
      source,
      options: ['check-pipe'],
    });

    if (!Array.isArray(failures)) return;

    const replacement = Replacement.applyFixes(
      source,
      failures.map((f) => f.getFix()!)
    );

    expect(replacement).to.eq(`
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo | async }}</div>
                      ~~~
        \`
      })
      class Bar {
        foo: any;
      }
    `);
  });

  it('should fail when extra space on both sides', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo + 1   |   async }}</div>
                           ~~~
        \`
      })
      class Bar {
        foo: any;
      }
    `;
    const failures = assertAnnotated({
      ruleName: 'angular-whitespace',
      message: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".',
      source,
      options: ['check-pipe'],
    });

    if (!Array.isArray(failures)) return;

    const replacement = Replacement.applyFixes(
      source,
      failures.map((f) => f.getFix()!)
    );

    expect(replacement).to.eq(`
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo + 1 | async }}</div>
                           ~~~
        \`
      })
      class Bar {
        foo: any;
      }
    `);
  });

  it('should fail when no space', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo + 1|async }}</div>
                        ~~~
        \`
      })
      class Bar {
        foo: any;
      }
    `;
    const failures = assertAnnotated({
      ruleName: 'angular-whitespace',
      message: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".',
      source,
      options: ['check-pipe'],
    });

    if (!Array.isArray(failures)) return;

    const replacement = Replacement.applyFixes(
      source,
      failures.map((f) => f.getFix()!)
    );

    expect(replacement).to.eq(`
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo + 1 | async }}</div>
                        ~~~
        \`
      })
      class Bar {
        foo: any;
      }
    `);
  });

  it('should fail when no space', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo + 1|async|bar }}</div>
                        ^^^   ~~~
        \`
      })
      class Bar {
        foo: any;
      }
    `;
    const failures = assertMultipleAnnotated({
      ruleName: 'angular-whitespace',
      failures: [
        { char: '~', msg: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".' },
        { char: '^', msg: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".' },
      ],
      source,
      options: ['check-pipe'],
    });
    const replacement = Replacement.applyFixes(
      source,
      failures.map((f) => f.getFix()!)
    );

    expect(replacement).to.eq(`
      @Component({
        selector: 'foo',
        template: \`
          <div>{{ foo + 1 | async | bar }}</div>
                        ^^^   ~~~
        \`
      })
      class Bar {
        foo: any;
      }
    `);
  });

  it('should fail when no space in property binding', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: \`
          <div [class]="foo|bar"></div>
                          ~~~
        \`
      })
      class Bar {
        foo: any;
      }
    `;
    const failures = assertAnnotated({
      ruleName: 'angular-whitespace',
      message: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".',
      source,
      options: ['check-pipe'],
    });

    if (!Array.isArray(failures)) return;

    const replacement = Replacement.applyFixes(
      source,
      failures.map((f) => f.getFix()!)
    );

    expect(replacement).to.eq(`
      @Component({
        selector: 'foo',
        template: \`
          <div [class]="foo | bar"></div>
                          ~~~
        \`
      })
      class Bar {
        foo: any;
      }
    `);
  });

  it('should fail when no space on one side', () => {
    let source = `
      @Component({
        selector: 'foo',
        template: \`
           <div *ngFor="let pony of ponies |slice:0:4">
                                          ~~~
             <h2>{{ pony.name }}</h2>
           </div>
        \`
      })
      class Bar {
        foo: any;
      }
    `;
    const failures = assertAnnotated({
      ruleName: 'angular-whitespace',
      message: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".',
      source,
      options: ['check-pipe'],
    });

    if (!Array.isArray(failures)) return;

    const replacement = Replacement.applyFixes(
      source,
      failures.map((f) => f.getFix()!)
    );

    expect(replacement).to.eq(`
      @Component({
        selector: 'foo',
        template: \`
           <div *ngFor="let pony of ponies | slice:0:4">
                                          ~~~
             <h2>{{ pony.name }}</h2>
           </div>
        \`
      })
      class Bar {
        foo: any;
      }
    `);
  });
});

describe('angular-whitespace multiple checks', () => {
  it('should work with proper style of interpolation and pipe', () => {
    let source = `
      @Component({
        template: \`
          <h4>{{ title | translate }}</h4>
        \`
      })
      class Bar {}
    `;
    assertSuccess('angular-whitespace', source, ['check-interpolation', 'check-pipe']);
  });

  describe('replacements', () => {
    it('should fail and apply proper replacements with multiple failures of interpolation and pipe', () => {
      let source = `
        @Component({
          template: \`
            <h4>{{title|translate }}</h4>
                ~~    ^^^
          \`
        })
        class Bar {}
      `;
      const failures = assertMultipleAnnotated({
        ruleName: 'angular-whitespace',
        failures: [
          { char: '~', msg: 'Missing whitespace in interpolation start; expecting {{ expr }}' },
          { char: '^', msg: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".' },
        ],
        source,
        options: ['check-interpolation', 'check-pipe'],
      });
      const replacement = Replacement.applyFixes(
        source,
        failures.map((f) => f.getFix()!)
      );

      expect(replacement).to.eq(`
        @Component({
          template: \`
            <h4>{{ title | translate }}</h4>
                ~~    ^^^
          \`
        })
        class Bar {}
      `);
    });
  });
});
