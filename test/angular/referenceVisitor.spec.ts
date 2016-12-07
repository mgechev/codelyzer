import {parseTemplate} from '../../src/angular/templates/templateParser';
import {ReferenceVisitor} from '../../src/angular/templates/referenceVisitor';
import {templateVisitAll} from '@angular/compiler';
import {expect} from 'chai';

describe('ReferenceVisitor', () => {
  it('should work with empty templates', () => {
    const template = parseTemplate('');
    const rv = new ReferenceVisitor();
    templateVisitAll(rv, template, null);
    expect(rv.variables.length).eq(0);
  });

  it('should work with simple templates', () => {
    const template = parseTemplate('<div></div>');
    const rv = new ReferenceVisitor();
    templateVisitAll(rv, template, null);
    expect(rv.variables.length).eq(0);
  });

  it('should work with templates with one reference', () => {
    const template = parseTemplate('<div #foo></div>');
    const rv = new ReferenceVisitor();
    templateVisitAll(rv, template, null);
    expect(rv.variables.length).eq(1);
    expect(rv.variables[0]).eq('foo');
  });

  it('should work with templates with nested elements with references', () => {
    const template = parseTemplate('<div #foo><span #bar></span></div>');
    const rv = new ReferenceVisitor();
    templateVisitAll(rv, template, null);
    expect(rv.variables.length).eq(2);
    expect(rv.variables[0]).eq('bar');
    expect(rv.variables[1]).eq('foo');
  });

  it('should work with templates with multiple elements with different references', () => {
    const template = parseTemplate('<div #foo><span #bar></span></div><span #qux></span>');
    const rv = new ReferenceVisitor();
    templateVisitAll(rv, template, null);
    expect(rv.variables.length).eq(3);
    expect(rv.variables[0]).eq('bar');
    expect(rv.variables[1]).eq('foo');
    expect(rv.variables[2]).eq('qux');
  });
});
