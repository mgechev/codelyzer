import { assertSuccess, assertAnnotated } from './testHelper';
import { Replacement } from 'tslint';
import { expect } from 'chai';

describe('trackBy-function', () => {
  describe('ngFor', () => {
    it('should have a trackBy function', () => {
      let source = `
      @Component({
        template: \`
         <ul>
            <li *ngFor="let person of persons; trackBy: trackByFn">
             {{ person.name }}
            </li>
         </ul>
         \`
      })
      class Bar {}
      `;
      assertSuccess('trackBy-function', source);
    });

    it('should have a trackBy function', () => {
      let source = `
      @Component({
        template: \`
         <ul>
            <li *ngFor="let person of persons; trackBy : trackByFn">
             {{ person.name }}
            </li>
         </ul>
         \`
      })
      class Bar {}
      `;
      assertSuccess('trackBy-function', source);
    });

  });


  describe('failure', () => {

    it('should fail when trackBy is misspelled', () => {
      let source = `
      @Component({
        template: \`
         <ul>
            <li *ngFor="let person of persons; trackBy trackByFn">
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             {{ person.name }}
            </li>
         </ul>
         \`
      })
      class Bar {}
      `;
      assertAnnotated({
        ruleName: 'trackBy-function',
        message: 'Missing trackBy function in ngFor directive',
        source
      });
    });

    it('should fail when the ngFor directive have not trackBy function', () => {
      let source = `
      @Component({
        template: \`
        <ul>
            <li *ngFor="let person of persons;">
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
             {{ person.name }}
            </li>
         </ul>
        \`
      })
      class Bar {}
      `;
      assertAnnotated({
        ruleName: 'trackBy-function',
        message: 'Missing trackBy function in ngFor directive',
        source
      });
    });

  });
});
