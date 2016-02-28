// import {PipeInfo} from '../src/walkers/collect_pipe_metadata_walker';
// import {DirectiveInfo} from '../src/walkers/collect_component_metadata_walker';
// import {ComponentMetadataCollector} from '../src/component_metadata_collector';
import {TemplateValidator} from '../src/template_validator';
// import {ComponentMetadata} from 'angular2/core';
import * as chai from 'chai';
import {join, normalize} from 'path';

describe('template_validator', () => {
  it('should validate template', () => {
    let cmpPath = normalize(join(__dirname, '..', '..', 'sample_data', 'cmp_a.ts'));
    let validator = new TemplateValidator();
    validator.validate(cmpPath);
  });
});
