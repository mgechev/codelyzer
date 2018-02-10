// tslint:disable:max-line-length
import { assertSuccess, assertAnnotated } from './testHelper';
import { Replacement } from 'tslint';
import { expect } from 'chai';

describe('cyclomatic complexity', () => {
    describe('success', () => {
        it('should work with a lower level of complexity', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="a === '1'">
            <li *ngFor="let person of persons; trackBy: trackByFn">
              {{ person.name }}
                <div [ngSwitch]="person.emotion">
                    <app-happy-hero    *ngSwitchCase="'happy'"    [hero]="currentHero"></app-happy-hero>
                    <app-sad-hero      *ngSwitchCase="'sad'"      [hero]="currentHero"></app-sad-hero>
                    <app-unknown-hero  *ngSwitchDefault           [hero]="currentHero"></app-unknown-hero>
                </div>
            </li>
        </div>
        \`
      })
      class Bar {}
      `;
            assertSuccess('template-cyclomatic-complexity', source);
        });

        it('should work with a higher level of complexity', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="a === '1'">
            <li *ngFor="let person of persons; trackBy: trackByFn">
             <div *ngIf="a === '1'">{{ person.name }}</div>
                <div [ngSwitch]="person.emotion">
                    <app-happy-hero    *ngSwitchCase="'happy'"    [hero]="currentHero"></app-happy-hero>
                    <app-sad-hero      *ngSwitchCase="'sad'"      [hero]="currentHero"></app-sad-hero>
                    <app-confused-hero *ngSwitchCase="'confused'" [hero]="currentHero"></app-confused-hero>
                    <app-unknown-hero  *ngSwitchDefault           [hero]="currentHero"></app-unknown-hero>
                </div>
            </li>
        </div>
        \`
      })
      class Bar {}
      `;
            assertSuccess('template-cyclomatic-complexity', source, [7]);
        });

    });


    describe('failure', () => {
        it('should fail with a higher level of complexity', () => {
            let source = `
      @Component({
        template: \`
        <div *ngIf="a === '1'">
            <li *ngFor="let person of persons; trackBy: trackByFn">
             <div *ngIf="a === '1'">{{ person.name }}</div>
                <div [ngSwitch]="person.emotion">
                    <app-happy-hero    *ngSwitchCase="'happy'"    [hero]="currentHero"></app-happy-hero>
                    <app-sad-hero      *ngSwitchCase="'sad'"      [hero]="currentHero"></app-sad-hero>
                    <app-confused-hero *ngSwitchCase="'confused'" [hero]="currentHero"></app-confused-hero>
                                       ~~~~~~~~~~~~~~~~~~~~~~~~~~
                    <app-unknown-hero  *ngSwitchDefault           [hero]="currentHero"></app-unknown-hero>
                </div>
            </li>
        </div>
        \`
      })
      class Bar {}
      `;
            assertAnnotated({
                ruleName: 'template-cyclomatic-complexity',
                message: 'The cyclomatic complexity exceeded the defined limit (cost \'5\'). Your template should be refactored.',
                source
            });
        });

    });

});
