import { getFailureMessage, Rule } from '../src/trackByFunctionRule';
import { assertAnnotated, assertMultipleAnnotated, assertSuccess } from './testHelper';

const {
  metadata: { ruleName }
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail when trackBy function is not present', () => {
      const source = `
        @Component({
          template: \`
            <ul>
              <li *ngFor="let item of [1, 2, 3];">
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                {{ item }}
              </li>
            </ul>
          \`
        })
        class Bar {}
      `;
      assertAnnotated({ message: getFailureMessage(), ruleName, source });
    });

    it('should fail when trackBy is missing colon', () => {
      const source = `
        @Component({
          template: \`
            <div *ngFor="let item of [1, 2, 3]; trackBy trackByFn">
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              {{ item }}
            </div>
          \`
        })
        class Bar {}
      `;
      assertAnnotated({ message: getFailureMessage(), ruleName, source });
    });

    it('should fail when [ngForTrackBy] is missing in ng-template', () => {
      const source = `
        @Component({
          template: \`
            <ng-template ngFor let-item [ngForOf]="[1, 2, 3]" let-i="index">
                                        ~~~~~~~~~~~~~~~~~~~~~
              {{ item }}
            </ng-template>
          \`
        })
        class Bar {}
      `;
      assertAnnotated({ message: getFailureMessage(), ruleName, source });
    });

    it('should fail when we have two ngFor and the second trackBy function is not present', () => {
      const source = `
       @Component({
          template: \`
          <div *ngFor="let item of [1, 2, 3]; trackBy: trackByFn">
            {{ item }}
           </div>
          <ul>
            <li *ngFor="let item of [1, 2, 3];">
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
               {{ item }}
            </li>
          </ul>
        \`
      })
     class Bar {}
     `;
      assertAnnotated({ message: getFailureMessage(), ruleName, source });
    });

    it('should fail when trackBy function is missing in multiple *ngFor', () => {
      const source = `
        @Component({
          template: \`
            <div *ngFor="let item of [1, 2, 3];">
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
              {{ item }}
            </div>

            <ng-template ngFor let-item [ngForOf]="[1, 2, 3]" let-i="index">
                                        ^^^^^^^^^^^^^^^^^^^^^
              {{ item }}
            </ng-template>
          \`
        })
        class Bar {}
      `;
      assertMultipleAnnotated({
        failures: [
          {
            char: '~',
            msg: getFailureMessage()
          },
          {
            char: '^',
            msg: getFailureMessage()
          }
        ],
        ruleName,
        source
      });
    });
  });

  describe('success', () => {
    it('should succeed when trackBy function is present', () => {
      const source = `
        @Component({
          template: \`
            <div *ngFor="let item of [1, 2, 3]; trackBy: trackByFn">
              {{ item }}
            </div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed when trackBy function and exported index value are present', () => {
      const source = `
        @Component({
          template: \`
            <div *ngFor="let item of [1, 2, 3]; let i = index; trackBy: trackByFn">
              {{ item }}
            </div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed when trackBy function is present and has trailing spaces', () => {
      const source = `
        @Component({
          template: \`
            <div *ngFor="let item of [1, 2, 3]; trackBy : trackByFn">
              {{ item }}
            </div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed when trackBy function is present and *ngFor uses single quotes', () => {
      const source = `
        @Component({
          template: \`
            <div *ngFor='let item of [1, 2, 3]; let i = index; trackBy: trackByFn'>
              {{ item }}
            </div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed when *ngFor is surrounded by a lot of whitespaces', () => {
      const source = `
        @Component({
          template: \`
            <div *ngFor  =  "let item of [1, 2, 3]; let i = index; trackBy : trackByFn">
              {{ item }}
            </div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed when [ngForTrackBy] is present in ng-template', () => {
      const source = `
        @Component({
          template: \`
            <ng-template ngFor let-item [ngForOf]="[1, 2, 3]" let-i="index"
              [ngForTrackBy]="trackByFn">
              {{ item }}
            </ng-template>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed when trackBy function is present in multiple *ngFor', () => {
      const source = `
        @Component({
          template: \`
            <div *ngFor="let item of ['a', 'b', 'c']; index as i; trackBy: trackByFn">
              {{ item }}
            </div>

            <ng-template ngFor let-item [ngForOf]="[1, 2, 3]" let-i="index"
              [ngForTrackBy]="trackByFn">
              {{ item }}
            </ng-template>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });
  });
});
