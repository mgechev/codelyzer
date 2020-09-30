import { expect } from 'chai';
import { Replacement } from 'tslint';
import { Rule } from '../src/templateBananaInBoxRule';
import { assertAnnotated, assertMultipleAnnotated, assertSuccess } from './testHelper';

const {
  FAILURE_STRING,
  metadata: { ruleName },
} = Rule;

describe(ruleName, () => {
  describe('failure', () => {
    it('should fail if the brackets are inside the parentheses', () => {
      const source = `
        @Component({
          template: \`
            <input type="text" name="foo" ([ngModel])="foo">
                                          ~~~~~~~~~~~~~~~~~
          \`
        })
        class Test {}
      `;
      assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });
    });

    it('should fail if there are multiple brackets inside the parentheses', () => {
      const source = `
        @Component({
          template: \`
            <app-item ([bar])="bar" ([item])="item" [(test)]="test"></app-item>
                      ~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^

            <div [oneWay]="oneWay" (emitter)="emitter" ([twoWay])="twoWay"></div>
                                                       %%%%%%%%%%%%%%%%%%%
          \`
        })
        class Test {}
      `;
      assertMultipleAnnotated({
        failures: [
          {
            char: '~',
            msg: FAILURE_STRING,
          },
          {
            char: '^',
            msg: FAILURE_STRING,
          },
          {
            char: '%',
            msg: FAILURE_STRING,
          },
        ],
        ruleName,
        source,
      });
    });
  });

  describe('success', () => {
    it('should succeed if one-way binding is used', () => {
      const source = `
        @Component({
          template: \`
            <input type="text" name="foo" [ngModel]="foo">
          \`
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if the parentheses are inside the brackets', () => {
      const source = `
        @Component({
          template: \`
            <input type="text" name="foo" [(ngModel)]="foo">
          \`
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });

    it('should succeed if the brackets are inside the parentheses in an output event', () => {
      const source = `
        @Component({
          template: \`
            <button type="button" (click)="navigate(['/resources'])">
              Navigate
            </button>
          \`
        })
        class Test {}
      `;
      assertSuccess(ruleName, source);
    });
  });

  describe('replacements', () => {
    it('should fail if the box is in the banana', () => {
      const source = `
        @Component({
          template: \`
            <input type="text" name="foo" ([ngModel])="foo">
                                          ~~~~~~~~~~~~~~~~~
          \`
        })
        class Test {}
      `;
      const failures = assertAnnotated({
        message: FAILURE_STRING,
        ruleName,
        source,
      });

      if (!Array.isArray(failures)) return;

      const replacement = Replacement.applyFixes(
        source,
        failures.map((f) => f.getFix()!)
      );
      const expectedSource = `
        @Component({
          template: \`
            <input type="text" name="foo" [(ngModel)]="foo">
                                          ~~~~~~~~~~~~~~~~~
          \`
        })
        class Test {}
      `;

      expect(replacement).to.eq(expectedSource);
    });

    it('should fail if there are multiple brackets inside the parentheses', () => {
      const source = `
        @Component({
          template: \`
            <app-item ([bar])="bar" ([item])="item" [(test)]="test"></app-item>
                      ~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^

            <div [oneWay]="oneWay" (emitter)="emitter" ([twoWay])="twoWay"></div>
                                                       %%%%%%%%%%%%%%%%%%%
          \`
        })
        class Test {}
      `;
      const failures = assertMultipleAnnotated({
        failures: [
          {
            char: '~',
            msg: FAILURE_STRING,
          },
          {
            char: '^',
            msg: FAILURE_STRING,
          },
          {
            char: '%',
            msg: FAILURE_STRING,
          },
        ],
        ruleName,
        source,
      });
      const replacement = Replacement.applyFixes(
        source,
        failures.map((f) => f.getFix()!)
      );
      const expectedSource = `
        @Component({
          template: \`
            <app-item [(bar)]="bar" [(item)]="item" [(test)]="test"></app-item>
                      ~~~~~~~~~~~~~ ^^^^^^^^^^^^^^^

            <div [oneWay]="oneWay" (emitter)="emitter" [(twoWay)]="twoWay"></div>
                                                       %%%%%%%%%%%%%%%%%%%
          \`
        })
        class Test {}
      `;

      expect(replacement).to.eq(expectedSource);
    });
  });
});
