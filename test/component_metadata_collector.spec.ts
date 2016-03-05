import {PipeInfo} from '../src/walkers/ts/collect_pipe_metadata_walker';
import {DirectiveInfo} from '../src/walkers/ts/collect_component_metadata_walker';
import {ComponentMetadataCollector} from '../src/component_metadata_collector';
import {ComponentMetadata} from 'angular2/core';
import * as chai from 'chai';
import {join, normalize} from 'path';

describe('collect_components_metadata', () => {
  it('should collect metadata', () => {
    let collector = new ComponentMetadataCollector();
    let cmpPath = normalize(join(__dirname, '..', '..', 'sample_data', 'cmp_a.ts'));
    let result = collector.getComponentTree(cmpPath);
    let a = (<ComponentMetadata>result[0].metadata);
    let b = a.directives[0];
    chai.assert.equal((<any>a.pipes[0]).metadata.name, 'p1');
    chai.assert.equal((<any>b).metadata.selector, 'b');
    chai.assert.deepEqual((<any>b).metadata.directives.map(d => d.metadata.selector), ['[d]', 'c']);
  });
});
