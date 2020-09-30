import * as editDistance from 'damerau-levenshtein';

const THRESHOLD = 2;

export const getSuggestion = (word: string, dictionary: string[] = [], limit = 2) => {
  const distances = dictionary.reduce((suggestions, dictionaryWord: string) => {
    const distance = editDistance(word.toUpperCase(), dictionaryWord.toUpperCase());
    const { steps } = distance;
    suggestions[dictionaryWord] = steps;
    return suggestions;
  }, {});

  return Object.keys(distances)
    .filter((suggestion) => distances[suggestion] <= THRESHOLD)
    .sort((a, b) => distances[a] - distances[b])
    .slice(0, limit);
};
