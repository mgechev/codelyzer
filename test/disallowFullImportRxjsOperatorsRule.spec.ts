import { assertAnnotated, assertSuccess } from './testHelper';

describe('disallow-full-import-rxjs-operators', () => {
  describe('invalid RxJS import', () => {
    it('should fail when the import is \'rxjs/add/operator/*\'', () => {
      let source = `
          import 'rxjs/add/operator/tap'
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `;
      assertAnnotated({
        ruleName: 'disallow-full-import-rxjs-operators',
        message: 'RxJS operators should be imported from their own scope.',
        source
      });
    });

    it('should fail when the import is from \'rxjs/operators\'', () => {
      let source = `
          import {tap} from 'rxjs/operators'
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `;
      assertAnnotated({
        ruleName: 'disallow-full-import-rxjs-operators',
        message: 'RxJS operators should be imported from their own scope.',
        source
      });
    });

    it('should fail when multiple imports are from \'rxjs/operators\'', () => {
      let source = `
          import {delay, tap} from 'rxjs/operators'
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      `;
      assertAnnotated({
        ruleName: 'disallow-full-import-rxjs-operators',
        message: 'RxJS operators should be imported from their own scope.',
        source
      });
    });
  });

  describe('valid import spacing', () => {
    it('should succeed with valid spacing', () => {
      let source = `
        import {
          tap
        } from 'rxjs/operators/tap';
      `;
      assertSuccess('disallow-full-import-rxjs-operators', source);
    });

    it('should work with alias imports', () => {
      let source = `
        import {tap} from 'rxjs/operators/tap';
      `;
      assertSuccess('disallow-full-import-rxjs-operators', source);
    });
  });
});
