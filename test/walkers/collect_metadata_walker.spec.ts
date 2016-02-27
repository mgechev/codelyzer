import {CollectMetadataWalker} from '../../src/walkers/collect_metadata_walker';
import * as chai from 'chai';
import * as tsc from 'typescript';

describe('collect_metadata_walker', () => {
  it('should collect metadata', () => {
    let file = tsc.createSourceFile('file.ts', `
      @Directive({
        selector: 'foobar',
        inputs: ['bar', 'baz'],
        outputs: ['bar', 'foo'],
        host: {
          '(click)': 'foobar()',
          '[baz]': 'baz',
          'role': 'button'
        }
      })
      class Foo {}
    `, tsc.ScriptTarget.ES2015, true);
    let visitor = new CollectMetadataWalker();
    visitor.walk(file);
    chai.assert.equal(visitor.metadata.selector, 'foobar', 'should get the selector value');
    chai.assert.deepEqual(visitor.metadata.host,
      { '(click)': 'foobar()', '[baz]': 'baz', 'role': 'button' }, 'should work with inline host');
    chai.assert.deepEqual(visitor.metadata.inputs, ['bar', 'baz']);
    chai.assert.deepEqual(visitor.metadata.outputs, ['bar', 'foo']);
  });
  it('should collect inline metadata', () => {
    let file = tsc.createSourceFile('file.ts', `
      @Directive({
        selector: 'foobar',
        inputs: ['bar', 'baz'],
        outputs: ['bar', 'foo'],
        host: {
          'role': 'button'
        }
      })
      class Foo {
        @HostBinding()
        baz: string;
        @HostBinding('bar')
        foobar: string;
        @HostListener('click')
        foobar() {}
      }
    `, tsc.ScriptTarget.ES2015, true);
    let visitor = new CollectMetadataWalker();
    visitor.walk(file);
    chai.assert.deepEqual(visitor.metadata.host,
      { '(click)': 'foobar()', '[baz]': 'baz', '[bar]': 'foobar', 'role': 'button' }, 'should work with inline host');
  });
});
