import {TemplateValidator} from '../src/template_validator';
import * as chai from 'chai';
import {join, normalize} from 'path';

describe('template_validator', () => {
  it('should validate template', () => {
    let cmpPath = normalize(join(__dirname, '..', '..', 'sample_data', 'cmp_a.ts'));
    let validator = new TemplateValidator();
    let errors = validator.validate(cmpPath);
    chai.assert.equal(errors[0].message,
`Template parse errors:
The pipe 'p2' could not be found ("<b [foo]='bar'></b>[ERROR ->]
{{'foo' | p2}}"): @0:19`);
  });
});
