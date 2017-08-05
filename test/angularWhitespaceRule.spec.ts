import { assertSuccess, assertAnnotated, assertMultipleAnnotated } from './testHelper';
import { Replacement } from 'tslint';
import { expect } from 'chai';
import { FsFileResolver } from '../src/angular/fileResolver/fsFileResolver';
import { MetadataReader } from '../src/angular/metadataReader';
import * as ts from 'typescript';
import chai = require('chai');

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

      it('should succeed with in structural directives with proper style', () => {
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
        const reader = new MetadataReader(new FsFileResolver());
        const ast = getAst(code, __dirname + '/../../test/fixtures/angularWhitespace/component.ts');
        assertSuccess('angular-whitespace', ast, ['check-pipe']);
      });

      it('should succeed with ngFor', () => {
        let source = `
        @Component({
          selector: 'foo',
          template: \`
            <div *ngFor="let pony of ponies | slice:0:1    ">{{ pony }}</div>
          \`
        })
        class Bar {
          ponies = [];
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
    });

    describe('check-semicolon', () => {

      it('should work with proper style', () => {
        let source = `
      @Component({
        template: \` <div *ngIf="codelyzer; is awesome;"></div> \`
      })
      class Bar {}
      `;
        assertSuccess('angular-whitespace', source, ['check-semicolon']);
      });

      it('should work with proper style also', () => {
        let source = `
      @Component({
        template: \` <div *ngIf="codelyzer; is; awesome;"></div> \`
      })
      class Bar {}
      `;
        assertSuccess('angular-whitespace', source, ['check-semicolon']);
      });

      it('should work with proper style also', () => {
        let source = `
      @Component({
        template: \` <div *ngIf="date | date:'mm;ss'; fails"></div> \`
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
                 ~~~~~~~
          \`
        })
        class Bar {}
        `;
      assertAnnotated({
        ruleName: 'angular-whitespace',
        message: 'Missing whitespace in interpolation; expecting {{ expr }}',
        source,
        options: ['check-interpolation']
      });
    });

    it('should fail when no space', () => {
      let source = `
        @Component({
          template: \`
            <div>{{foo }}</div>
                 ~~~~~~~~
          \`
        })
        class Bar {}
        `;
      assertAnnotated({
        ruleName: 'angular-whitespace',
        message: 'Missing whitespace in interpolation; expecting {{ expr }}',
        source,
        options: ['check-interpolation']
      });
    });

    describe('replacements', () => {
      it('should fail and apply proper replacements when style is incorrect', () => {
        let source = `
          @Component({
            template: \`
              <div>  {{foo}}   </div>
                     ~~~~~~~
            \`
          })
          class Bar {}`;
        const failures = assertAnnotated({
          ruleName: 'angular-whitespace',
          message: 'Missing whitespace in interpolation; expecting {{ expr }}',
          source,
          options: ['check-interpolation']
        });

        const res = Replacement.applyAll(source, failures[0].getFix());
        expect(res).to.eq(`
          @Component({
            template: \`
              <div>  {{ foo }}   </div>
                     ~~~~~~~
            \`
          })
          class Bar {}`);
      });

      it('should fail and apply proper replacements when style is incorrect', () => {
        let source = `
          @Component({
            template: \`
              <div>
              some additional text
                {{foo}}
                ~~~~~~~
              </div>
            \`
          })
          class Bar {}`;
        const failures = assertAnnotated({
          ruleName: 'angular-whitespace',
          message: 'Missing whitespace in interpolation; expecting {{ expr }}',
          source,
          options: ['check-interpolation']
        });

        const res = Replacement.applyAll(source, failures[0].getFix());
        expect(res).to.eq(`
          @Component({
            template: \`
              <div>
              some additional text
                {{ foo }}
                ~~~~~~~
              </div>
            \`
          })
          class Bar {}`);
      });

      it('should fail and apply proper replacements when style is incorrect with multiple failures', () => {
        let source = `
          @Component({
            template: \`
              <div>
              some additional text
                {{foo}}
                ~~~~~~~
                some other text
                {{  bar  }}
                ^^^^^^^^^^^
              </div>
            \`
          })
          class Bar {}`;
        const failures = assertMultipleAnnotated({
          ruleName: 'angular-whitespace',
          failures: [
            {char: '~', msg: 'Missing whitespace in interpolation; expecting {{ expr }}', },
            {char: '^', msg: 'Extra whitespace in interpolation; expecting {{ expr }}', },
          ],
          source,
          options: ['check-interpolation']
        });

        const res = Replacement.applyAll(source, [].concat.apply([], failures.map(f => f.getFix())));
        expect(res).to.eq(`
          @Component({
            template: \`
              <div>
              some additional text
                {{ foo }}
                ~~~~~~~
                some other text
                {{ bar }}
                ^^^^^^^^^^^
              </div>
            \`
          })
          class Bar {}`);
      });

      it('should fail and apply proper replacements when style is incorrect', () => {
        let source = `
          @Component({
            template: \`
              <div>  {{foo }}   </div>
                     ~~~~~~~~
            \`
          })
          class Bar {}`;
        const failures = assertAnnotated({
          ruleName: 'angular-whitespace',
          message: 'Missing whitespace in interpolation; expecting {{ expr }}',
          source,
          options: ['check-interpolation']
        });

        const res = Replacement.applyAll(source, failures[0].getFix());
        expect(res).to.eq(`
          @Component({
            template: \`
              <div>  {{ foo }}   </div>
                     ~~~~~~~~
            \`
          })
          class Bar {}`);
      });

      it('should remove extra spaces', () => {
        let source = `
          @Component({
            template: \`
              <div>{{  foo    }}</div>
                   ~~~~~~~~~~~~~
            \`
          })
          class Bar {}`;
        const failures = assertAnnotated({
          ruleName: 'angular-whitespace',
          message: 'Extra whitespace in interpolation; expecting {{ expr }}',
          source,
          options: ['check-interpolation']
        });

        const res = Replacement.applyAll(source, failures[0].getFix());
        expect(res).to.eq(`
          @Component({
            template: \`
              <div>{{ foo }}</div>
                   ~~~~~~~~~~~~~
            \`
          })
          class Bar {}`);
      });
    });
  });

  describe('check-semicolon', () => {

    it('should fail when no space after semicolon', () => {
      let source = `
      @Component({
        template: \` <div *ngIf="codelyzer; is;awesome;"></div>
                                              ~~
        \`
      })
      class Bar {}
      `;
      assertAnnotated({
        ruleName: 'angular-whitespace',
        message: 'Missing whitespace after semicolon; expecting \'; expr\'',
        source,
        options: ['check-semicolon']
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
        message: 'Missing whitespace after semicolon; expecting \'; expr\'',
        source,
        options: ['check-semicolon']
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
        message: 'Missing whitespace after semicolon; expecting \'; expr\'',
        source,
        options: ['check-semicolon']
      });
    });

    describe('replacements', () => {
      it('should fail when no space after semicolon', () => {
        let source = `
      @Component({
        template: \` <div *ngIf="codelyzer; is;awesome;"></div>
                                              ~~
        \`
      })
      class Bar {}
      `;
        const failures = assertAnnotated({
          ruleName: 'angular-whitespace',
          message: 'Missing whitespace after semicolon; expecting \'; expr\'',
          source,
          options: ['check-semicolon']
        });

        const res = Replacement.applyAll(source, failures[0].getFix());
        expect(res).to.eq(`
      @Component({
        template: \` <div *ngIf="codelyzer; is; awesome;"></div>
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
          message: 'Missing whitespace after semicolon; expecting \'; expr\'',
          source,
          options: ['check-semicolon']
        });

        const res = Replacement.applyAll(source, failures[0].getFix());
        expect(res).to.eq(`
      @Component({
        template: \` <div *ngIf="date | date:'mm;ss'; fails"></div>
                                                    ~~
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
      options: ['check-pipe']
    });

    const res = Replacement.applyAll(source, failures[0].getFix());
    expect(res).to.eq(`
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
      options: ['check-pipe']
    });

    const res = Replacement.applyAll(source, failures[0].getFix());
    expect(res).to.eq(`
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
      options: ['check-pipe']
    });

    const res = Replacement.applyAll(source, failures[0].getFix());
    expect(res).to.eq(`
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
      options: ['check-pipe']
    });

    const res = Replacement.applyAll(source, failures[0].getFix());
    expect(res).to.eq(`
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
        {char: '~', msg: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".', },
        {char: '^', msg: 'The pipe operator should be surrounded by one space on each side, i.e. " | ".', },
      ],
      source,
      options: ['check-pipe']
    });
    const fixes = [].concat.apply([], failures.map(f => f.getFix()));
    const res = Replacement.applyAll(source, fixes);
    expect(res).to.eq(`
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
      options: ['check-pipe']
    });

    const res = Replacement.applyAll(source, failures[0].getFix());
    expect(res).to.eq(`
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
});

