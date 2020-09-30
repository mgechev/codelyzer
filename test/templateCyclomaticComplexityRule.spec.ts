import { getFailureMessage, Rule } from '../src/templateCyclomaticComplexityRule';
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
            <div *ngIf="a === '1'">
              <div *ngFor="let person of persons; trackBy: trackByFn">
                <div *ngIf="a === '1'">{{ person.name }}</div>

                <div [ngSwitch]="person.emotion">
                  <app-happy-hero    *ngSwitchCase="'happy'"    [hero]="currentHero"></app-happy-hero>
                  <app-sad-hero      *ngSwitchCase="'sad'"      [hero]="currentHero"></app-sad-hero>
                  <app-confused-hero *ngSwitchCase="'confused'" [hero]="currentHero"></app-confused-hero>
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~
                  <app-unknown-hero  *ngSwitchDefault           [hero]="currentHero"></app-unknown-hero>
                </div>
              </div>
            </div>
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: getFailureMessage(),
        ruleName,
        source,
      });
    });

    it('should fail with a higher level of complexity using directives with ng-template', () => {
      const source = `
        @Component({
          template: \`
            <div [fakeDirective]="'test'"></div>

            <ng-template ngFor let-person [ngForOf]="persons" let-i="index">
              {{ person.name }}
            </ng-template>

            <ng-template [ngIf]="a === '1'">
              something here
            </ng-template>

            <div *ngIf="a === '1'">
              <div *ngFor="let person of persons; trackBy: trackByFn">
                <div *ngIf="a === '1'">{{ person.name }}</div>

                <div [ngSwitch]="person.emotion">
                  <app-happy-hero    *ngSwitchCase="'happy'"    [hero]="currentHero"></app-happy-hero>
                  <app-sad-hero      *ngSwitchCase="'sad'"      [hero]="currentHero"></app-sad-hero>
                                     ~~~~~~~~~~~~~~~~~~~~~
                  <app-confused-hero *ngSwitchCase="'confused'" [hero]="currentHero"></app-confused-hero>
                  <app-unknown-hero  *ngSwitchDefault           [hero]="currentHero"></app-unknown-hero>
                </div>
              </div>
            </div>
          \`
        })
        class Bar {}
      `;
      assertAnnotated({
        message: getFailureMessage(6),
        options: [6],
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should work with a lower level of complexity', () => {
      const source = `
        @Component({
          template: \`
            <div *ngIf="a === '1'">
              <div *ngFor="let person of persons; trackBy: trackByFn">
                {{ person.name }}
                <div [ngSwitch]="person.emotion">
                  <app-happy-hero    *ngSwitchCase="'happy'" [hero]="currentHero"></app-happy-hero>
                  <app-sad-hero      *ngSwitchCase="'sad'"   [hero]="currentHero"></app-sad-hero>
                  <app-unknown-hero  *ngSwitchDefault        [hero]="currentHero"></app-unknown-hero>
                </div>
              </div>
            </div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should work with a higher level of complexity', () => {
      const source = `
        @Component({
          template: \`
            <div *ngIf="a === '1'">
              <div *ngFor="let person of persons; trackBy: trackByFn">
                <div *ngIf="a === '1'">{{ person.name }}</div>

                <div [ngSwitch]="person.emotion">
                  <app-happy-hero    *ngSwitchCase="'happy'"    [hero]="currentHero"></app-happy-hero>
                  <app-sad-hero      *ngSwitchCase="'sad'"      [hero]="currentHero"></app-sad-hero>
                  <app-confused-hero *ngSwitchCase="'confused'" [hero]="currentHero"></app-confused-hero>
                  <app-unknown-hero  *ngSwitchDefault           [hero]="currentHero"></app-unknown-hero>
                </div>
              </div>
            </div>
          \`
        })
        class Bar {}
      `;
      assertSuccess(ruleName, source, [7]);
    });
  });
});
