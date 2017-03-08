import {assertAnnotated, assertSuccess} from './testHelper';

const ruleName = `no-inapplicable-life-cycle`;

describe.only(ruleName, () => {

  describe(`using OnInit`, () => {
    it(`should fail when class is not annotated`, () => {
      const source = `
      class App implements OnInit { }
            ~~~
      `;
      assertAnnotated({
        ruleName, source,
        message: 'The App class is not a Component or Directive yet implements a life cycle hook OnInit.',
      });
    });
    it(`should pass when class is a component`, () => {
      const source1 = `@Component() class App implements OnInit { }`;
      const source2 = `@Component() @Injectable() class App implements OnInit { }`;
      const source3 = `@Component @Injectable class App implements OnInit { }`;
      assertSuccess(ruleName, source1);
      assertSuccess(ruleName, source2);
      assertSuccess(ruleName, source3);
    });
    it(`should fail when class is a service`, () => {
      const message = 'The App class is not a Component or Directive yet implements a life cycle hook OnInit.';
      let source = `
      @Injectable() class App implements OnInit { }
                          ~~~
      `;
      assertAnnotated({ruleName, source, message});
      source = `
      @Injectable class App implements OnInit { }
                        ~~~
      `;
      assertAnnotated({ruleName, source, message});
    });
  });

  describe(`using OnDestroy`, () => {
    it(`should fail when class is not annotated`, () => {
      const source = `
      class App implements OnDestroy { }
            ~~~
      `;
      assertAnnotated({
        ruleName, source,
        message: 'The App class is not a Component or Directive yet implements a life cycle hook OnDestroy.',
      });
    });
    it(`should pass when class is a directive`, () => {
      const source1 = `@Directive() class App implements OnDestroy { }`;
      const source2 = `@Directive() @Injectable() class App implements OnDestroy { }`;
      assertSuccess(ruleName, source1);
      assertSuccess(ruleName, source2);
    });
    it(`should pass when class is a service`, () => {
      const source = `@Injectable() class App implements OnDestroy { }`;
      assertSuccess(ruleName, source);
    });
  });

  describe(`using OnInit and OnDestroy`, () => {
    it(`should fail when class is not annotated`, () => {
      const source = `
      class App implements OnInit, OnDestroy { }
            ~~~
      `;
      assertAnnotated({
        ruleName, source,
        message: 'The App class is not a Component or Directive yet implements these life cycle hooks: OnInit, OnDestroy.',
      });
    });
    it(`should pass when class is a component`, () => {
      const source1 = `@Component() class App implements OnInit, OnDestroy { }`;
      const source2 = `@Component() @Injectable() class App implements OnInit, OnDestroy { }`;
      assertSuccess(ruleName, source1);
      assertSuccess(ruleName, source2);
    });
    it(`should fail when class is a service`, () => {
      const source = `
      @Injectable() class App implements OnInit, OnDestroy { }
                          ~~~
      `;
      assertAnnotated({
        ruleName, source,
        message: 'The App class is not a Component or Directive yet implements a life cycle hook OnInit.',
      });
    });
  });

  describe(`inheritance`, () => {
    it(`should pass a basic case`, () => {
      const source = `
                   class Base implements OnInit, OnDestroy { }
      @Component() class Drvd extends Base { }
      `;
      assertSuccess(ruleName, source);
    });
    it(`should pass a more complex case`, () => {
      const source = `
                    class Base implements OnDestroy { }
      @Component()  class Cmp1 extends Base implements OnInit, OnChanges { }
      @Component()  class Cmp2 extends Base implements OnInit { }
      @Injectable() class Srv1 extends Base { }  
      `;
      assertSuccess(ruleName, source);
    });

    it(`should fail a basic case`, () => {
      // Note that this doesn't fail in `Base`, even though it would fail if it wasn't extended.
      const source = `
                    class Base implements OnInit, OnDestroy { }
      @Injectable() class Drvd extends Base { }
                          ~~~~
      `;
      const message = `The Drvd class is not a Component or Directive yet implements a life cycle hook OnInit (from Base).`;
      assertAnnotated({ruleName, source, message});
    });
    it(`should fail a more complex case`, () => {
      // Note that this doesn't fail in `VeryBase` or `Base`, even though it would fail if it wasn't extended.
      const source = `
                         class VeryBase implements OnInit, MyInterface, OnDestroy { }
                         class Base     extends VeryBase implements AfterViewInit { }
      @CustomDecorator() class A        extends Base { }
                               ~
      `;
      const message = `The A class is not a Component or Directive yet implements these life cycle hooks: ` +
        `OnInit (from Base -> VeryBase), OnDestroy (from Base -> VeryBase), AfterViewInit (from Base).`;
      assertAnnotated({ruleName, source, message});
    });
  });

  describe(`multiple inheritance paths`, () => {
    // TODO: merge these two in a single test (blocked by assert annotated working with multiple failures)
    it(`should work`, () => {
      const source = `
                    class A           implements AfterViewInit { }
                    class B extends A implements OnInit { }
                          ~
                    class C extends A implements OnDestroy, OnChanges { }
      @Component()  class D extends C { }
      `;
      const message = `The B class is not a Component or Directive yet implements these life cycle hooks: ` +
          `AfterViewInit (from A), OnInit.`;
      assertAnnotated({ruleName, source, message});
    });
    it(`should work`, () => {
      const source = `
                    class A           implements AfterViewInit{ }
                    class C extends A implements OnDestroy, OnChanges { }
      @Component()  class D extends C { }
      @Injectable() class E extends C { }
                          ~
      `;
      const message = `The E class is not a Component or Directive yet implements these life cycle hooks: ` +
          `AfterViewInit (from C -> A), OnChanges (from C).`;
      assertAnnotated({ruleName, source, message});
    });
  });

});
