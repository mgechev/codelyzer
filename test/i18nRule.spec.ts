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
import { assertFailure } from './testHelper';
import chai = require('chai');

const getAst = (code: string, file = 'file.ts') => {
  return ts.createSourceFile(file, code, ts.ScriptTarget.ES5, true);
};

describe('i18n', () => {
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

  describe('check-id', () => {
    it('should work with i18n attribute', () => {
      let source = `
      @Component({
	template: \`
	  <div i18n>Text</div>
	\`
      })
      class Bar {}
      `;
      assertSuccess('i18n', source, ['check-text']);
    });

    it('should work without i18n attribute & interpolation', () => {
      let source = `
      @Component({
	template: \`
	  <div>{{text}}</div>
	\`
      })
      class Bar {}
      `;
      assertSuccess('i18n', source, ['check-text']);
    });

    it('should fail with missing id string', () => {
      let source = `
      @Component({
	template: \`
	  <div>Text</div>
	       ~~~~
	\`
      })
      class Bar {}
      `;
      assertAnnotated({
	ruleName: 'i18n',
	options: ['check-text'],
	source,
	message:
	  'Each element containing text node should has an i18n attribute'
      });
    });

    it('should fail with text outside element with i18n attribute', () => {
      let source = `
      @Component({
	template: \`
	  <div i18n>Text</div>
	  foo
	\`
      })
      class Bar {}
      `;
      assertFailure(
	'i18n',
	source,
	{
	  message:
	    'Each element containing text node should has an i18n attribute',
	  startPosition: {
	    line: 3,
	    character: 30
	  },
	  endPosition: {
	    line: 5,
	    character: 8
	  }
	},
	['check-text']
      );
    });
  });
});
