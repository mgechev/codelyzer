import {SelectorRule} from './selectorNameBase';

export class Rule extends SelectorRule {
  public handleType = 'Component';
  public getTypeFailure():any { return 'The selector of the component "%s" should be used as %s ($$05-03$$)'; }
  public getNameFailure():any { return 'The selector of the component "%s" should be named %s ($$05-02$$)'; }
  getSinglePrefixFailure():any { return 'The selector of the component "%s" should have prefix "%s" ($$02-07$$)'; }
  getManyPrefixFailure():any { return 'The selector of the component "%s" should have one of the prefixes: %s ($$02-07$$)'; }
}
