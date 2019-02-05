import { assertSuccess, assertAnnotated } from './testHelper';

describe('component-change-detection', () => {
  describe('invalid component change detection', () => {
    it('should fail when component used without preferred change detection type', () => {
      let source = `
        @Component({
          changeDetection: ChangeDetectionStrategy.Default
                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        })
        class Test {}
      `;
      assertAnnotated({
        ruleName: 'component-change-detection',
        message: 'The changeDetection value of the component "Test" should be set to ChangeDetectionStrategy.OnPush',
        source
      });
    });

    it('should fail when component change detection is not set', () => {
      let source = `
      @Component({
      ~~~~~~~~~~~~
        selector: 'foo'
      })
      ~~
      class Test {}`;
      assertAnnotated({
        ruleName: 'component-change-detection',
        message: 'The changeDetection value of the component "Test" should be set to ChangeDetectionStrategy.OnPush',
        source
      });
    });
  });

  describe('valid component selector', () => {
    it('should succeed when a valid change detection strategy is set on @Component', () => {
      let source = `
        @Component({
          changeDetection: ChangeDetectionStrategy.OnPush
        })
        class Test {}
      `;
      assertSuccess('component-change-detection', source);
    });
  });
});
