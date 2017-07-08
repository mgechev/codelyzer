import {assertAnnotated, assertMultipleAnnotated, assertSuccess} from './testHelper';

describe('decorator-not-allowed', () => {

  describe('not allowed input property', () => {
    it(`should fail, when the class have an @Injectable decorator`, () => {
      let source = `
      @Injectable()
      class MyService {
        @Input('attribute') label: string;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }`;
      assertAnnotated({
        ruleName: 'decorator-not-allowed',
        message: 'In the class "MyService" which have the "@Injectable" decorator, the ' +
        '"@Input" decorator not allowed. ' +
        'Please, drop it.',
        source
      });
    });
  });

  describe('not allowed output property', () => {
    it(`should fail, when the class have an @Injectable decorator`, () => {
      let source = `
      @Injectable()
      class MyService {
        @Output('change') change = new EventEmitter<any>();
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }`;
      assertAnnotated({
        ruleName: 'decorator-not-allowed',
        message: 'In the class "MyService" which have the "@Injectable" decorator, the ' +
        '"@Output" decorator not allowed. ' +
        'Please, drop it.',
        source
      });
    });
  });

 /* describe('not allowed input and output properties', () => {
    it(`should fail, when the class have an @Injectable decorator`, () => {
      let source = `
      @Injectable()
      class MyService {
        @Input('attribute') label: string;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        @Output('change') change = new EventEmitter<any>();
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      }`;
      assertMultipleAnnotated({
        ruleName: 'decorator-not-allowed',
        failures: [
          {char: '~', msg: 'In the class "MyService" which have the "@Injectable" decorator, the ' +
          '"@Input" decorator not allowed. ' +
          'Please, drop it.'},
          {char: '^', msg: 'In the class "MyService" which have the "@Injectable" decorator, the ' +
          '"@Output" decorator not allowed. ' +
          'Please, drop it.'}
        ],
        source,
        options: []
      });
    });
  }); */


  describe('not allowed @HostListener property', () => {
    it(`should fail, when the class have an @Injectable decorator`, () => {
      let source = `
      @Injectable()
      class MyService {
        @HostBinding('style.backgroundColor') color = "red"; 
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      }`;
      assertAnnotated({
        ruleName: 'decorator-not-allowed',
        message: 'In the class "MyService" which have the "@Injectable" decorator, the ' +
        '"@HostBinding" decorator not allowed. ' +
        'Please, drop it.',
        source
      });
    });
  });

    describe('not allowed output property', () => {
      it(`should fail, when the class have an @Injectable decorator`, () => {
        let source = `
      @Injectable()
      class MyService {
        @HostListener('mouseenter') onEnter() {
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          this.color= "blue" ;
        }
        ~
      }`;
        assertAnnotated({
          ruleName: 'decorator-not-allowed',
          message: 'In the class "MyService" which have the "@Injectable" decorator, the ' +
          '"@HostListener" decorator not allowed. ' +
          'Please, drop it.',
          source
        });
      });
    });

  describe('valid service class', () => {
    it('should succeed when is used @Injectable decorator', () => {
      let source = `
            @Directive()
            class TestDirective {
            @Input() label: string
            }`;
      assertSuccess('decorator-not-allowed', source);
    });
  });

  describe('valid service class', () => {
    it('should succeed when is used @Injectable decorator', () => {
      let source = `
            @Directive()
            class TestDirective {
            @Output('change') change = new EventEmitter<any>();
            }`;
      assertSuccess('decorator-not-allowed', source);
    });
  });

  describe('valid service class', () => {
    it('should succeed when is used @Injectable decorator', () => {
      let source = `
            @Directive()
            class TestDirective {
              @HostBinding('style.backgroundColor') color = "red"; 
              @HostListener('mouseenter') onEnter() {
                this.color= "blue" ;
              }
            }`;
      assertSuccess('decorator-not-allowed', source);
    });
  });



});
