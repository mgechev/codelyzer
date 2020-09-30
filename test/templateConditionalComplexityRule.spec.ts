import { getFailureMessage, Rule } from '../src/templateConditionalComplexityRule';
import { assertAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail with a higher level of complexity', () => {
      const source = `
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
      assertAnnotated({ message: getFailureMessage(5, 4), options: [4], ruleName, source });
    });

    it('should fail with a higher level of complexity and a carrier return', () => {
      const source = `
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
      assertAnnotated({ message: getFailureMessage(5, 3), ruleName, source });
    });

    it('should fail with a higher level of complexity with ng-template', () => {
      const source = `
        @Component({
          template: \`
            <ng-template [ngIf]="a === '3' || (b === '3' && c.d !== '1'
                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                        && e.f !== '6' && q !== g && x === '1')">
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              Enter details
            </ng-template>
          \`
        })
        class Bar {}
      `;
      assertAnnotated({ message: getFailureMessage(6, 3), ruleName, source });
    });
  });

  describe('success', () => {
    it('should succeed with a lower level of complexity', () => {
      const source = `
        @Component({
          template: \`
            <div *ngIf="a === '1' || b === '2' && c.d !== e">
              Enter your card details
            </div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed with a lower level of complexity with separated statements', () => {
      const source = `
        @Component({
          template: \`
            <div *ngIf="a === '1' || (b === '2' && c.d !== e)">
              Enter your card details
            </div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed with a level of complexity customizable', () => {
      const source = `
        @Component({
          template: \`
            <div *ngIf="a === '3' || (b === '3' && c.d !== '1' && e.f !== '6' && q !== g)">
              Enter your card details
            </div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source, [5]);
    });

    it('should succeed with a level of complexity customizable', () => {
      const source = `
        @Component({
          template: \`
            <div *ngIf="(b === '3' && c.d !== '1' && e.f !== '6' && q !== g) || a === '3'">
              Enter your card details
            </div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source, [5]);
    });

    it('should succeed with non-inlined then template', () => {
      const source = `
        @Component({
          template: \`
            <div *ngIf="isValid; then thenBlock; else elseBlock">
              Enter your card details
            </div>
            <ng-template #thenBlock>
              thenBlock
            </ng-template>
            <ng-template #elseBlock>
              elseBlock
            </ng-template>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source, [5]);
    });
  });
});
