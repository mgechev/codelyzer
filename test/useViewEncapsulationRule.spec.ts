import { assertAnnotated, assertSuccess } from './testHelper';

describe('use-view-encapsulation', () => {
  describe('invalid view encapsulation', () => {
    it('should fail if ViewEncapsulation.None is set', () => {
      const source = `
        @Component({
          selector: 'sg-foo-bar',
          encapsulation: ViewEncapsulation.None
                         ~~~~~~~~~~~~~~~~~~~~~~
        })
        export class TestComponent { }
      `;

      assertAnnotated({
        ruleName: 'use-view-encapsulation',
        message: 'Using "ViewEncapsulation.None" may cause conflicts between css rules having the same selector',
        source
      });
    });
  });

  describe('valid view encapsulation', () => {
    it('should succeed if ViewEncapsulation.Native is set', () => {
      const source = `
        @Component({
          selector: 'sg-foo-bar',
          encapsulation: ViewEncapsulation.Native
        })
        export class TestComponent { }
      `;

      assertSuccess('use-view-encapsulation', source);
    });

    it('should succeed if ViewEncapsulation.Emulated is set', () => {
      const source = `
        @Component({
          selector: 'sg-foo-bar',
          encapsulation: ViewEncapsulation.Emulated
        })
        export class TestComponent { }
      `;

      assertSuccess('use-view-encapsulation', source);
    });

    it('should succeed if no ViewEncapsulation is set explicitly', () => {
      const source = `
        @Component({
          selector: 'sg-foo-bar',
        })
        export class TestComponent { }
      `;

      assertSuccess('use-view-encapsulation', source);
    });
  });
});
