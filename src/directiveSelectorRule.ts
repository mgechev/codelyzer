import {SelectorRule} from './selectorNameBase';

export class Rule extends SelectorRule {
    public getTypeFailure():any { return 'The selector of the directive "%s" should be used as %s ($$02-06$$)'};
    public getNameFailure():any { return 'The selector of the directive "%s" should be named %s ($$02-06$$)'};
    getSinglePrefixFailure():any { return 'The selector of the directive "%s" should have prefix "%s" ($$02-08$$)'};
    getManyPrefixFailure():any { return 'The selector of the directive "%s" should have one of the prefixes: %s ($$02-08$$)'};
}



