import { expect } from 'chai';

import { getSuggestion } from '../../src/util/getSuggestion';

describe('getSuggestion', () => {
  it('should suggest based on dictionary', () => {
    const suggestion = getSuggestion('wordd', ['word', 'words', 'wording'], 2);
    expect(suggestion).to.deep.equals(['word', 'words']);
  });

  it("should not suggest if the dictionary doesn't have any similar words", () => {
    const suggestion = getSuggestion('ink', ['word', 'words', 'wording'], 2);
    expect(suggestion).to.deep.equals([]);
  });
});
