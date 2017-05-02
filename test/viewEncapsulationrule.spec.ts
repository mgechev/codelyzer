describe('use-view-encapsulation', () => {
  describe('invalid view encapsulation', () => {
    it('should fail if ViewEncapsulation.None is set', () => {
      const source = `
        @Component({
          selector: 'sg-foo-bar',
          encapsulation: ViewEncapsulation.None
                                           ~~~~
        })
        export class TestComponent { }
      `;
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
    });

    it('should succeed if ViewEncapsulation.Emulated is set', () => {
      const source = `
        @Component({
          selector: 'sg-foo-bar',
          encapsulation: ViewEncapsulation.Emulated
        })
        export class TestComponent { }
      `;
    });
  });
});
