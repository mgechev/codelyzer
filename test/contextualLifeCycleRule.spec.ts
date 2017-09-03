import {assertAnnotated, assertFailures, assertSuccess} from './testHelper';

describe('contextual-life-cycle', () => {

  describe('success', () => {


    describe('valid component class', () => {
      it('should succeed when is used ngOnInit() method', () => {
        let source = `
            @Component()
            class TestComponent {
              ngOnInit() { this.logger.log('OnInit'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

      it('should succeed when is used ngOnChanges() method', () => {
        let source = `
            @Component()
            class TestComponent {
              ngOnChanges() { this.logger.log('OnChanges'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

      it('should succeed when is used ngDoCheck() method', () => {
        let source = `
            @Component()
            class TestComponent {
              ngDoCheck() { this.logger.log('DoCheck'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

      it('should succeed when is used ngAfterContentInit() method', () => {
        let source = `
            @Component()
            class TestComponent {
              ngAfterContentInit() { this.logger.log('AfterContentInit'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

      it('should succeed when is used ngAfterContentChecked() method', () => {
        let source = `
            @Component()
            class TestComponent {
              ngAfterContentChecked() { this.logger.log('AfterContentChecked'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

      it('should succeed when is used ngAfterViewInit() method', () => {
        let source = `
            @Component()
            class TestComponent {
              ngAfterViewInit() { this.logger.log('AfterViewInit'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

      it('should succeed when is used ngAfterViewChecked() method', () => {
        let source = `
            @Component()
            class TestComponent {
              ngAfterViewChecked() { this.logger.log('AfterViewChecked'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

      it('should succeed when is used ngOnDestroy() method', () => {
        let source = `
            @Component()
            class TestComponent {
              ngOnDestroy() { this.logger.log('OnDestroy'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

    });


    describe('valid directive class', () => {
      it('should succeed when is used ngOnInit() method', () => {
        let source = `
            @Directive()
            class TestDirective {
              ngOnInit() { this.logger.log('OnInit'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

      it('should succeed when is used ngOnChanges() method', () => {
        let source = `
            @Directive()
            class TestDirective {
              ngOnChanges() { this.logger.log('OnChanges'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

      it('should succeed when is used ngDoCheck() method', () => {
        let source = `
            @Directive()
            class TestDirective {
              ngDoCheck() { this.logger.log('DoCheck'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

      it('should succeed when is used ngOnDestroy() method', () => {
        let source = `
            @Directive()
            class TestDirective {
              ngOnDestroy() { this.logger.log('OnDestroy'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

    });


    describe('valid service class', () => {

      it('should succeed when is used ngOnDestroy() method', () => {
        let source = `
            @Injectable()
            class TestService {
              ngOnDestroy() { this.logger.log('OnDestroy'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

    });

    describe('valid pipe class', () => {

      it('should succeed when is used ngOnDestroy() method', () => {
        let source = `
            @Pipe()
            class TestPipe {
              ngOnDestroy() { this.logger.log('OnDestroy'); }
            }`;
        assertSuccess('contextual-life-cycle', source);
      });

    });

  });

  describe('failure', () => {

    describe('valid directive class', () => {


      it('should fail when is used ngAfterContentInit() method', () => {
        let source = `
            @Directive()
            class TestDirective {
              ngAfterContentInit() { this.logger.log('AfterContentInit'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestDirective" which have the "@Directive" decorator, the ' +
          '"ngAfterContentInit()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngAfterContentChecked() method', () => {
        let source = `
            @Directive()
            class TestDirective {
              ngAfterContentChecked() { this.logger.log('AfterContentChecked'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestDirective" which have the "@Directive" decorator, the ' +
          '"ngAfterContentChecked()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngAfterViewInit() method', () => {
        let source = `
            @Directive()
            class TestDirective {
              ngAfterViewInit() { this.logger.log('AfterViewInit'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestDirective" which have the "@Directive" decorator, the ' +
          '"ngAfterViewInit()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngAfterViewChecked() method', () => {
        let source = `
            @Directive()
            class TestDirective {
              ngAfterViewChecked() { this.logger.log('AfterViewChecked'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestDirective" which have the "@Directive" decorator, the ' +
          '"ngAfterViewChecked()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });


    });


    describe('valid service class', () => {

      it('should fail when is used ngOnInit() method', () => {
        let source = `
            @Injectable()
            class TestService {
              ngOnInit() { this.logger.log('OnInit'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestService" which have the "@Injectable" decorator, the ' +
          '"ngOnInit()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngOnChanges() method', () => {
        let source = `
            @Injectable()
            class TestService {
              ngOnChanges() { this.logger.log('OnChanges'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestService" which have the "@Injectable" decorator, the ' +
          '"ngOnChanges()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngDoCheck() method', () => {
        let source = `
            @Injectable()
            class TestService {
              ngDoCheck() { this.logger.log('DoCheck'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestService" which have the "@Injectable" decorator, the ' +
          '"ngDoCheck()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });


      it('should fail when is used ngAfterContentInit() method', () => {
        let source = `
            @Injectable()
            class TestService {
              ngAfterContentInit() { this.logger.log('AfterContentInit'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestService" which have the "@Injectable" decorator, the ' +
          '"ngAfterContentInit()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngAfterContentChecked() method', () => {
        let source = `
            @Injectable()
            class TestService {
              ngAfterContentChecked() { this.logger.log('AfterContentChecked'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestService" which have the "@Injectable" decorator, the ' +
          '"ngAfterContentChecked()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngAfterViewInit() method', () => {
        let source = `
            @Injectable()
            class TestService {
              ngAfterViewInit() { this.logger.log('AfterViewInit'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestService" which have the "@Injectable" decorator, the ' +
          '"ngAfterViewInit()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngAfterViewChecked() method', () => {
        let source = `
            @Injectable()
            class TestService {
              ngAfterViewChecked() { this.logger.log('AfterViewChecked'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestService" which have the "@Injectable" decorator, the ' +
          '"ngAfterViewChecked()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });


    });

    describe('valid pipe class', () => {

      it('should fail when is used ngOnInit() method', () => {
        let source = `
            @Pipe()
            class TestPipe {
              ngOnInit() { this.logger.log('OnInit'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestPipe" which have the "@Pipe" decorator, the ' +
          '"ngOnInit()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngOnChanges() method', () => {
        let source = `
            @Pipe()
            class TestPipe {
              ngOnChanges() { this.logger.log('OnChanges'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestPipe" which have the "@Pipe" decorator, the ' +
          '"ngOnChanges()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngDoCheck() method', () => {
        let source = `
            @Pipe()
            class TestPipe {
              ngDoCheck() { this.logger.log('DoCheck'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestPipe" which have the "@Pipe" decorator, the ' +
          '"ngDoCheck()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });


      it('should fail when is used ngAfterContentInit() method', () => {
        let source = `
            @Pipe()
            class TestPipe {
              ngAfterContentInit() { this.logger.log('AfterContentInit'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestPipe" which have the "@Pipe" decorator, the ' +
          '"ngAfterContentInit()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngAfterContentChecked() method', () => {
        let source = `
            @Pipe()
            class TestPipe {
              ngAfterContentChecked() { this.logger.log('AfterContentChecked'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestPipe" which have the "@Pipe" decorator, the ' +
          '"ngAfterContentChecked()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngAfterViewInit() method', () => {
        let source = `
            @Pipe()
            class TestPipe {
              ngAfterViewInit() { this.logger.log('AfterViewInit'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestPipe" which have the "@Pipe" decorator, the ' +
          '"ngAfterViewInit()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });

      it('should fail when is used ngAfterViewChecked() method', () => {
        let source = `
            @Pipe()
            class TestPipe {
              ngAfterViewChecked() { this.logger.log('AfterViewChecked'); }
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            }`;
        assertAnnotated({
          ruleName: 'contextual-life-cycle',
          message: 'In the class "TestPipe" which have the "@Pipe" decorator, the ' +
          '"ngAfterViewChecked()" hook method is not allowed. ' +
          'Please, drop it.',
          source
        });
      });


    });

  });

});
