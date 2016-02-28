import {CollectComponentsMetadata} from '../../src/walkers/collect_metadata_walker';
import * as chai from 'chai';

describe('collect_components_metadata', () => {
  it('should collect metadata', () => {
    let collector = new CollectComponentsMetadata();
    let result = collector.getDirectivesTree('./sample_data/cmp_a.ts');
    console.log(result);
  });
});
