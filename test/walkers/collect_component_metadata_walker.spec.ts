import {CollectComponentMetadataWalker} from '../../src/walkers/collect_component_metadata_walker';
import {ComponentMetadata} from 'angular2/core';
import * as chai from 'chai';
import * as tsc from 'typescript';

describe('collect_component_metadata_walker', () => {
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
    let visitor = new CollectComponentMetadataWalker();
    visitor.getMetadata(file);
    chai.assert.equal(visitor.directives[0].metadata.selector, 'foobar', 'should get the selector value');
    chai.assert.deepEqual(visitor.directives[0].metadata.host,
      { '(click)': 'foobar()', '[baz]': 'baz', 'role': 'button' }, 'should work with inline host');
    chai.assert.deepEqual(visitor.directives[0].metadata.inputs, ['bar', 'baz']);
    chai.assert.deepEqual(visitor.directives[0].metadata.outputs, ['bar', 'foo']);
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
    let visitor = new CollectComponentMetadataWalker();
    visitor.getMetadata(file);
    chai.assert.deepEqual(visitor.directives[0].metadata.host,
      { '(click)': 'foobar()', '[baz]': 'baz', '[bar]': 'foobar', 'role': 'button' }, 'should work with inline host');
  });
  it('should work with multiple directives per file', () => {
    let file = tsc.createSourceFile('file.ts', `
      @Directive({
        selector: 'foo'
      })
      class Foo {}
      @Component({
        selector: 'bar',
        inputs: ['bar', 'baz'],
        outputs: ['bar', 'foo'],
        directives: [Foo],
        host: {
          'role': 'button'
        }
      })
      class Bar {}
    `, tsc.ScriptTarget.ES2015, true);
    let visitor = new CollectComponentMetadataWalker();
    visitor.getMetadata(file);
    chai.assert.equal(visitor.directives.length, 2);
    let dir = visitor.directives[0];
    let component = visitor.directives[1];
    chai.assert.equal(dir.metadata.selector, 'foo');
    chai.assert.equal(component.metadata.selector, 'bar');
    chai.assert.deepEqual(component.metadata.inputs, ['bar', 'baz']);
    chai.assert.deepEqual((<ComponentMetadata>component.metadata).directives, ['Foo']);
  });
  it('should work with external templates', () => {
    let file = tsc.createSourceFile('file.ts', `
      @Component({
        selector: 'bar',
        templateUrl: '../../../sample_data/external_template.html'
      })
      class Bar {}
    `, tsc.ScriptTarget.ES2015, true);
    let visitor = new CollectComponentMetadataWalker();
    visitor.getMetadata(file);
    chai.assert.equal(visitor.directives.length, 1);
    chai.assert.equal(visitor.directives[0].metadata.template, '<div></div>');
  });
});
