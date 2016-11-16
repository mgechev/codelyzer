import { SelectorRule } from './selectorNameBase';
export declare class Rule extends SelectorRule {
    handleType: string;
    getTypeFailure(): any;
    getNameFailure(): any;
    getSinglePrefixFailure(): any;
    getManyPrefixFailure(): any;
}
