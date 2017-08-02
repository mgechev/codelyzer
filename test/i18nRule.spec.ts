import {
  assertSuccess,
  assertAnnotated,
  assertMultipleAnnotated
} from './testHelper';
import { Replacement } from 'tslint';
import { expect } from 'chai';
import { FsFileResolver } from '../src/angular/fileResolver/fsFileResolver';
import { MetadataReader } from '../src/angular/metadataReader';
import * as ts from 'typescript';
import chai = require('chai');

const getAst = (code: string, file = 'file.ts') => {
  return ts.createSourceFile(file, code, ts.ScriptTarget.ES5, true);
};

describe.only('i18n', () => {
  describe('check-id', () => {
    it('should work with proper id', () => {
      let source = `
      @Component({
        template: \`
          <div i18n="test@@foo">Text</div>
        \`
      })
      class Bar {}
      `;
      assertSuccess('i18n', source, ['check-id']);
    });

    it('should work with proper id', () => {
      let source = `
      @Component({
        template: \`
          <div i18n="@@foo">Text</div>
        \`
      })
      class Bar {}
      `;
      assertSuccess('i18n', source, ['check-id']);
    });

    it('should fail with missing id string', () => {
      let source = `
      @Component({
        template: \`
          <div i18n="foo@@">Text</div>
               ~~~~~~~~~~~~
        \`
      })
      class Bar {}
      `;
      assertAnnotated({
        ruleName: 'i18n',
        options: ['check-id'],
        source,
        message:
          'Missing custom message identifier. For more information visit https://angular.io/guide/i18n'
      });
    });

    it('should fail with missing id', () => {
      let source = `
      @Component({
        template: \`
          <div i18n="foo">Text</div>
               ~~~~~~~~~~
        \`
      })
      class Bar {}
      `;
      assertAnnotated({
        ruleName: 'i18n',
        options: ['check-id'],
        source,
        message:
          'Missing custom message identifier. For more information visit https://angular.io/guide/i18n'
      });
    });
  });
});
