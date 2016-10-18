import {assertFailure, assertSuccess} from './testHelper';

describe('no-dead-css', () => {
  describe('valid cases', () => {

    it('should succeed when having valid simple selector', () => {
      let source = `
        @Component({
          selector: 'foobar',
          template: '<div>{{ foo }}</div>',
          styles: [
            \`
            div {
              color: red;
            }
            \`
          ]
        })
        class Test {
          bar: number;
        }`;
        assertSuccess('no-dead-css', source);
    });

    describe('complex selectors', () => {

      it('should succeed when having valid complex selector', () => {
        let source = `
          @Component({
            selector: 'foobar',
            template: \`<div>
              <section>
                <span><h1>{{ foo }}</h1></span>
              </section>
            </div>\`,
            styles: [
              \`
              div h1 {
                color: red;
              }
              \`
            ]
          })
          class Test {
            bar: number;
          }`;
          assertSuccess('no-dead-css', source);
      });

      it('should succeed when having valid complex selector', () => {
        let source = `
          @Component({
            selector: 'foobar',
            template: \`<div class="bar"></div>\`,
            styles: [
              \`
              div.bar {
                color: red;
              }
              \`
            ]
          })
          class Test {
            bar: number;
          }`;
          assertSuccess('no-dead-css', source);
      });

      it('should succeed when having valid complex selector', () => {
        let source = `
          @Component({
            selector: 'foobar',
            template: \`<div>
              <section>
                <span><h1 id="header">{{ foo }}</h1></span>
              </section>
            </div>\`,
            styles: [
              \`
              div h1#header {
                color: red;
              }
              \`
            ]
          })
          class Test {
            bar: number;
          }`;
          assertSuccess('no-dead-css', source);
      });

    });

  });
});
