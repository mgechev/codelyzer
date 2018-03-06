// tslint:disable:max-line-length
import { assertSuccess, assertAnnotated } from './testHelper';

describe('complexity', () => {
    describe('success', () => {
        it('should work with a lower level of complexity', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="a === '1' || (b === '2' && c.d !== e)">
            Enter your card details
        </div>
        \`
      })
      class Bar {}
      `;
            assertSuccess('template-conditional-complexity', source);
        });


        it('should work with a lower level of complexity', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="a === '1' || b === '2' && c.d !== e">
            Enter your card details
        </div>
        \`
      })
      class Bar {}
      `;
            assertSuccess('template-conditional-complexity', source);
        });

        it('should work with a level of complexity customisable', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="a === '3' || (b === '3' && c.d !== '1' && e.f !== '6' && q !== g)">
            Enter your card details
        </div>
        \`
      })
      class Bar {}
      `;
            assertSuccess('template-conditional-complexity', source, [5]);
        });

        it('should work with a level of complexity customisable', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="(b === '3' && c.d !== '1' && e.f !== '6' && q !== g) || a === '3'">
            Enter your card details
        </div>
        \`
      })
      class Bar {}
      `;
            assertSuccess('template-conditional-complexity', source, [5]);
        });

        it('should work with something else', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="isValid;then content else other_content">
            Enter your card details
        </div>
        \`
      })
      class Bar {}
      `;
            assertSuccess('template-conditional-complexity', source, [5]);
        });

    });


    describe('failure', () => {
        it('should fail with a higher level of complexity', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="a === '3' || (b === '3' && c.d !== '1' && e.f !== '6' && q !== g)">
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Enter your card details
        </div>
        \`
      })
      class Bar {}
      `;
            assertAnnotated({
                ruleName: 'template-conditional-complexity',
                message: 'The condition complexity (cost \'5\') exceeded the defined limit (cost \'4\'). The conditional expression should be moved into the component.',
                source,
                options: [4]
            });
        });

    });

    describe('failure', () => {
        it('should fail with a higher level of complexity and a carrier return', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="a === '3' || (b === '3' && c.d !== '1'
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    && e.f !== '6' && q !== g)">
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Enter your card details
        </div>
        \`
      })
      class Bar {}
      `;
            assertAnnotated({
                ruleName: 'template-conditional-complexity',
                message: 'The condition complexity (cost \'5\') exceeded the defined limit (cost \'3\'). The conditional expression should be moved into the component.',
                source
            });
        });

    });


});
