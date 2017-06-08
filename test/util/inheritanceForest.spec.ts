import {InheritanceForest} from '../../src/util/inheritanceForest';
import chai = require('chai');

describe(`InheritanceForest`, () => {
  const simpleForest = new InheritanceForest();
  simpleForest.add('B', ['A']).add('C', ['B']);

  const complexForest = new InheritanceForest();
  complexForest
    .add('B', ['A', 'OnInit'])
    .add('C', ['OnDestroy', 'OnChanges', 'A'])
    .add('D', ['C'])
    .add('RandomDerived', ['RandomBase'])
    .add('E', ['C']);

  describe(`get heritage info`, () => {
    it(`should work (simple)`, () => {
      chai.assert.deepEqual(simpleForest.getHeritage('B'), ['A']);
      chai.assert.deepEqual(simpleForest.getHeritage('C'), ['B', 'A']);
    });

    it(`should work (complex)`, () => {
      chai.assert.deepEqual(complexForest.getHeritage('B'), ['A', 'OnInit']);
      chai.assert.deepEqual(complexForest.getHeritage('C'), ['OnDestroy', 'OnChanges', 'A']);
      chai.assert.deepEqual(complexForest.getHeritage('D'), ['C', 'OnDestroy', 'OnChanges', 'A']);
      chai.assert.deepEqual(complexForest.getHeritage('E'), ['C', 'OnDestroy', 'OnChanges', 'A']);
    });

    it(`should work when there is no heritage`, () => {
      chai.assert.deepEqual(simpleForest.getHeritage('A'), []);
    });
  });
  describe(`get path`, () => {
    it(`should work (simple)`, () => {
      chai.assert.deepEqual(simpleForest.getPath('B', 'A'), ['B', 'A']);
      chai.assert.deepEqual(simpleForest.getPath('C', 'A'), ['C', 'B', 'A']);
      chai.assert.deepEqual(simpleForest.getPath('A', 'C'), null);
    });
    it(`should work (complex)`, () => {
      chai.assert.deepEqual(complexForest.getPath('B', 'A'), ['B', 'A']);
      chai.assert.deepEqual(complexForest.getPath('B', 'OnInit'), ['B', 'OnInit']);
      chai.assert.deepEqual(complexForest.getPath('C', 'A'), ['C', 'A']);
      chai.assert.deepEqual(complexForest.getPath('E', 'OnDestroy'), ['E', 'C', 'OnDestroy']);
      chai.assert.deepEqual(complexForest.getPath('E', 'OnChanges'), ['E', 'C', 'OnChanges']);
      chai.assert.deepEqual(complexForest.getPath('E', 'OnInit'), null);
    });
    it(`should work when source and destination are the same`, () => {
      chai.assert.deepEqual(simpleForest.getPath('A', 'A'), ['A']);
      chai.assert.deepEqual(simpleForest.getPath('B', 'B'), ['B']);
      chai.assert.deepEqual(complexForest.getPath('OnInit', 'OnInit'), ['OnInit']);
    });
  })
});
