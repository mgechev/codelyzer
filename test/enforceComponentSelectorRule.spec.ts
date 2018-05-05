import { assertAnnotated, assertSuccess } from './testHelper';

describe('enforceComoponentSelectorRule', () => {
  it('should fail when selector is not given in @Component', () => {
    let source = `
      @Component()
      ~~~~~~~~~~~~
      class Test {}`;
    assertAnnotated({
      ruleName: 'enforce-component-selector',
      message: 'The selector of the component "Test" is mandatory',
      source
    });
  });

  it('should fail when selector is empty in @Component', () => {
    let source = `
      @Component({
      ~~~~~~~~~~~~
        selector: ''
      })
      ~~
      class Test {}`;
    assertAnnotated({
      ruleName: 'enforce-component-selector',
      message: 'The selector of the component "Test" is mandatory',
      source
    });
  });

  it('should fail when selector equals 0 in @Component', () => {
    let source = `
      @Component({
      ~~~~~~~~~~~~
        selector: 0
      })
      ~~
      class Test {}`;
    assertAnnotated({
      ruleName: 'enforce-component-selector',
      message: 'The selector of the component "Test" is mandatory',
      source
    });
  });

  it('should fail when selector equals null in @Component', () => {
    let source = `
      @Component({
      ~~~~~~~~~~~~
        selector: null
      })
      ~~
      class Test {}`;
    assertAnnotated({
      ruleName: 'enforce-component-selector',
      message: 'The selector of the component "Test" is mandatory',
      source
    });
  });

  it('should succeed when selector is given in @Component', () => {
    let source = `
      @Component({
        selector: 'sg-bar-foo'
      })
      class Test {}`;
    assertSuccess('enforce-component-selector', source);
  });
});
