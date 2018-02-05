// based on https://github.com/wimpyprogrammer/conditional-expression-parser - LICENSE MIT - Copyright (c) 2015 Andrew Keller
import * as Lint from 'tslint';
import * as ts from 'typescript';
import * as ast from '@angular/compiler';
import { sprintf } from 'sprintf-js';
import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
import { NgWalker } from './angular/ngWalker';
import { isObject } from 'util';


export class Rule extends Lint.Rules.AbstractRule {
    public static metadata: Lint.IRuleMetadata = {
        ruleName: 'template-conditional-complexity',
        type: 'functionality',
        description: 'The condition complexity shouldn\'t exceed a rational limit in a template.',
        rationale: 'An important complexity complicates the tests and the maintenance.',
        options: {
            type: 'array',
            items: {
              type: 'string'
            },
            minLength: 0,
            maxLength: 2,
          },
          optionExamples: [
            'true',
            '[true, 4]'
          ],
        optionsDescription: 'Not configurable.',
        typescriptOnly: true,
        hasFix: false

    };

    // tslint:disable-next-line:max-line-length
    static COMPLEXITY_FAILURE_STRING = 'The condition complexity (cost \'%s\') exceeded the defined limit (cost \'%s\'). The conditional expression should be move in the component\'s template.';

    static COMPLEXITY_MAX = 3;

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {

        return this.applyWithWalker(
            new NgWalker(sourceFile,
                this.getOptions(), {
                    templateVisitorCtrl: TemplateConditionalComplexityVisitor,
                }));
    }
}


class TemplateConditionalComplexityVisitor extends BasicTemplateAstVisitor {

    visitDirectiveProperty(prop: ast.BoundDirectivePropertyAst, context: BasicTemplateAstVisitor): any {

        if (prop.sourceSpan) {
            const directive = (<any>prop.sourceSpan).toString();

            if (directive.startsWith('*ngIf')) {
                // extract expression and drop characters new line and quotes
                const expr = directive.split(/\*ngIf\s*=\s*/)[1].slice(1, -1).replace(/[\n\r]/g, '');
                const expression = new Expression(expr);

                let complexity = 0;
                let expressions: Array<Expression> = [expression];

                while (expressions.length) {
                    let currentExpression = expressions.pop();
                    for (let i = 0; i < currentExpression.conditions.length; i++) {
                        if (currentExpression.conditions[i] instanceof Condition) {
                            complexity++;
                        } else if (currentExpression.conditions[i] instanceof Expression) {
                            expressions.push(currentExpression.conditions[i]);
                        }
                    }
                }

                const options = this.getOptions();
                const complexityMax: number = options.length ? options[0] : Rule.COMPLEXITY_MAX;

                if (complexity > complexityMax) {
                    const span = prop.sourceSpan;
                    let failureConfig: string[] = [String(complexity), String(Rule.COMPLEXITY_MAX)];
                    failureConfig.unshift(Rule.COMPLEXITY_FAILURE_STRING);
                    this.addFailure(this.createFailure(span.start.offset, span.end.offset - span.start.offset,
                        sprintf.apply(this, failureConfig))
                    );
                }
            }
        }
        super.visitDirectiveProperty(prop, context);
    }
}


class Utils {

    static tokensLineBreak = ['\\r', '\\n', '\\r\\n'];
    static tokensAnd = ['&&', '\\sAND\\s']; // "&&" or "AND"
    static tokensOr = ['\\|\\|', '\\sOR\\s']; // "||" or "OR"
    static tokensXor = ['\\^', '\\sXOR\\s']; // "^" or "XOR"
    static tokensAndOrXor = [].concat(Utils.tokensAnd, Utils.tokensOr, Utils.tokensXor);


    static trimParenthesisPairs(text: string) {
        let process =  (input) => {
            input = input.trim();
            if (input[0] === '(' && input[input.length - 1] === ')') {
                input = input.substring(1, input.length - 1);
            }
            return input;
        };

        let processedString = process(text);

        // Continue removing parenthesis pairs until no more remain.
        while (text !== processedString) {
            text = processedString;
            processedString = process(text);
        }

        return text;
    }

    static findTopLevelParenthesis(text: string) {
        let inSingleQuote = false,
            inDoubleQuote = false,
            conditionalDepth = 0,
            functionCallDepth = 0,
            parenthesisPairs = [/*{ start, end }*/],
            i, iParenthesisStart;

        for (i = 0; i < text.length; i++) {
            // If the character is escaped, don't mistake it as syntax
            if (this.isEscaped(text, i)) {
                continue;
            }

            if (inSingleQuote && text[i] === '\'') { // found the closing single quote
                inSingleQuote = false;
            } else if (inDoubleQuote && text[i] === '"') { // found the closing double quote
                inDoubleQuote = false;
            } else if (text[i] === '\'') { // found an opening single quote
                inSingleQuote = true;
            } else if (text[i] === '"') { // found an opening double quote
                inDoubleQuote = true;
            } else if (text[i] === ')') { // found a closing parenthesis
                if (functionCallDepth > 0) { // ignore parenthesis within a function call
                    functionCallDepth--;
                } else {
                    conditionalDepth--;
                    if (conditionalDepth === 0) { // found a top-level parenthesis
                        parenthesisPairs.push({start: iParenthesisStart, end: i});
                    }
                }
            } else if (text[i] === '(') { // found an opening parenthesis
                if (functionCallDepth > 0 || this.isFunctionCall(text, i)) { // ignore parenthesis to start or within a function call
                    functionCallDepth++;
                } else {
                    if (conditionalDepth === 0) { // found top-level parenthesis
                        iParenthesisStart = i;
                    }
                    conditionalDepth++;
                }
            }
        }

        return parenthesisPairs;
    }

    static removeIgnoredText(text: any): Array<any> {
        let inSingleQuote = false,
            inDoubleQuote = false,
            functionCallDepth = 0,
            ignoredText = [],
            i, iSingleQuoteStart, iDoubleQuoteStart, iFunctionCallStart;

        let captureIgnoredText = (iStart, iEnd) => {
            const strToRemove = text.substring(iStart, iEnd + 1);
            ignoredText.push(strToRemove);
            const strToInsert = '{' + (ignoredText.length - 1) + '}';
            // Adjust i to the end of the inserted string instead of the removed one
            i += strToInsert.length - strToRemove.length;
            return this.stringSplice(text, iStart, iEnd - iStart + 1, strToInsert);
        };

        for (i = 0; i < text.length; i++) {
            // If the character is escaped, don't mistake it as syntax
            if (this.isEscaped(text, i)) {
                continue;
            }

            if (text[i] === '{' || text[i] === '}') {
                text = captureIgnoredText(i, i); // capture curly braces so they don't interfere with our placeholder syntax
            } else if (inSingleQuote && text[i] === '\'') { // found the closing single quote
                inSingleQuote = false;
                text = captureIgnoredText(iSingleQuoteStart, i); // ignore contents of single-quoted strings
            } else if (inDoubleQuote && text[i] === '"') { // found the closing double quote
                inDoubleQuote = false;
                text = captureIgnoredText(iDoubleQuoteStart, i); // ignore contents of double-quoted strings
            } else if (text[i] === '\'') { // found an opening single quote
                inSingleQuote = true;
                iSingleQuoteStart = i;
            } else if (text[i] === '"') { // found an opening double quote
                inDoubleQuote = true;
                iDoubleQuoteStart = i;
            } else if (text[i] === ')') { // found a closing parenthesis
                if (functionCallDepth > 0) { // ignore parenthesis within a function call
                    functionCallDepth--;
                    if (functionCallDepth === 0) { // found the end of a function call
                        text = captureIgnoredText(iFunctionCallStart, i); // ignore contents of function calls
                    }
                }
            } else if (text[i] === '(') { // found an opening parenthesis
                if (functionCallDepth > 0 || this.isFunctionCall(text, i)) { // ignore parenthesis to start or within a function call
                    if (functionCallDepth === 0) {
                        iFunctionCallStart = i;
                    }
                    functionCallDepth++;
                }
            }
        }

        return [text, ignoredText];
    }

    static restoreIgnoredText(text, ignoredText): string {
        let captureIgnoredTextPlaceholder = new RegExp(
            '(\\{(\\d+)\\})' // capture curly braces and the digits inside
            , 'ig'), matches, replacementText;

        while (matches = captureIgnoredTextPlaceholder.exec(text)) {
            replacementText = ignoredText[matches[2]];
            // Swap the placeholder text {#} with the referenced text in ignoredText.
            text = this.stringSplice(text, matches.index, matches[1].length, replacementText);
            captureIgnoredTextPlaceholder.lastIndex -= matches[0].length;
        }

        return text;
    }

    static hasMixedOperators(operators): boolean {

        return (operators.length > 1 && operators.some((e, i, arr) => {
            return (i > 0 && (e.toString() !== arr[i - 1].toString()));
        }));
    }

    static mergeDeep(target, ...sources) {
        if (!sources.length) {
            return target;
        }
        const source = sources.shift();

        if (isObject(target) && isObject(source)) {
            for (const key in source) {
                if (isObject(source[key])) {
                    if (!target[key]) {
                        Object.assign(target, {[key]: {}});
                    }
                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, {[key]: source[key]});
                }
            }
        }

        return this.mergeDeep(target, ...sources);
    }


    private static stringSplice(str, index, count, add): Array<any> {
        return str.slice(0, index) + add + str.slice(index + count);
    }

    private static  isEscaped(string, index): boolean {
        return (index > 0 && string[index - 1] === '\\' && !this.isEscaped(string, index - 1));
    }

    private static  isFunctionCall(string, index): boolean {
        // To determine if the parenthesis is a sub-expression or a function call, look at the preceding characters
        let precedingCharacters = string.substring(0, index + 1),
            matchConditional = new RegExp(
                '(?:^|' + Utils.tokensAndOrXor.join('|') + ')\\s*\\($'
                , 'i');
        return !matchConditional.test(precedingCharacters);
    }

}


class Condition {
    constructor(private text: string) {
    }
}

enum COND_TYPE {
    TYPE_AND = 'AND',
    TYPE_OR = 'OR',
    TYPE_XOR = 'XOR'
}

class Operator {

    private type: COND_TYPE;


    constructor(type: COND_TYPE) {
        switch (type.valueOf()) {
            case 'OR':
                this.type = COND_TYPE.TYPE_OR;
                break;
            case 'XOR':
                this.type = COND_TYPE.TYPE_XOR;
                break;
            default:
                this.type = COND_TYPE.TYPE_AND;
                break;
        }
    }

    toString() {
        return this.type;
    }

    isAnd() {
        return this.type === COND_TYPE.TYPE_AND;
    }

    isOr() {
        return this.type === COND_TYPE.TYPE_OR;
    }

    isXor() {
        return this.type === COND_TYPE.TYPE_XOR;
    }


}

class EvalTree {

    evalPaths: Array<any>;

    constructor(expression: Expression, _treeType: any) {

        const treeType = Boolean(_treeType);
        this.evalPaths = [/*{ condition, result }*/];

        if (expression.hasMixedOperators) {
            // TODO: Can we calculate when operators are mixed?
            throw 'Expressions with mixed operators cannot be evaluated';
        }

        // Calculate the combinations of Conditions that will resolve to true
        if (expression.conditions.length === 1) {
            // There's only one condition, so it must match treeType
            this.evalPaths.push([{condition: expression.conditions[0], result: treeType}]);
        } else {

            if (expression.operators[0].isAnd()) {

                if (treeType === true) {
                    // Create one evalPath where every condition is true
                    this.evalPaths = this.generateEvalPathsUniformResult(expression.conditions, true);
                } else {
                    // Create a separate falsePath for each Condition where one is false
                    this.evalPaths = this.generateEvalPathsIndividualResult(expression.conditions, false);
                }

            } else if (expression.operators[0].isOr()) {

                if (treeType === true) {
                    // Create a separate evalPath for each Condition where one is true
                    this.evalPaths = this.generateEvalPathsIndividualResult(expression.conditions, true);
                } else {
                    // Create one falsePath where every condition is false
                    this.evalPaths = this.generateEvalPathsUniformResult(expression.conditions, false);
                }

            } else { // XOR operator

                // A XOR expression is true if it has an odd number of true conditions
                const isTrueCondition =  (c) => {
                        return c.result;
                    },
                    hasOddTrues = (ep) => {
                        return ep.filter(isTrueCondition).length % 2 === 1;
                    },
                    allEvalPaths = this.calculateAllEvalPaths(expression.conditions);

                allEvalPaths.forEach((evalPath) => {
                    if (hasOddTrues(evalPath) !== treeType === false) {
                        this.evalPaths.push(evalPath);
                    }
                });

            }
        }
    }


    private calculateAllEvalPaths(conditions): Array<any> {
        // recursively calculate the eval paths of all the subsequent elements
        let subEvalPaths: Array<any> = (conditions.length === 1) ? [[]] : this.calculateAllEvalPaths(conditions.slice(1)),
            evalPaths = [],
            tempEvalPath;

        // For each of the sub paths, create versions where this condition is true and false
        subEvalPaths.forEach((e) => {
            (tempEvalPath = Utils.mergeDeep(e)).unshift({condition: conditions[0], result: true});
            evalPaths.push(tempEvalPath);
            (tempEvalPath = Utils.mergeDeep(e)).unshift({condition: conditions[0], result: false});
            evalPaths.push(tempEvalPath);
        });

        return evalPaths;
    }

    // Generate eval paths where each condition has the specified result
    private generateEvalPathsIndividualResult(conditions, result): Array<any> {
        let evalPaths = [], evalPath;
        conditions.forEach((unused, i1) => {
            evalPath = [];
            conditions.forEach((c, i2) => {
                evalPath.push({condition: c, result: (i1 === i2) ? result : null});
            });
            evalPaths.push(evalPath);
        });
        return evalPaths;
    }

    // Generate an eval path with the specified result for all conditions
    private generateEvalPathsUniformResult(conditions, result): Array<any> {
        let evalPaths = [[]];
        conditions.forEach((c) => {
            evalPaths[0].push({condition: c, result: result});
        });
        return evalPaths;
    }


}

class Expression {

    operators = [];
    conditions = [];

    // trim surrounding space and parenthesis pairs
    textToParse: string;
    topLevelParenthesis: any;
    textChunks = [];
    lastPosition = 0;

    conditionChunks = [];
    matchAndOrXor = new RegExp(
        '(\\s|\\b)(?=' + Utils.tokensAndOrXor.join('|') + ')'
        , 'ig');
    captureLeadingAnd = new RegExp(
        '^(' + Utils.tokensAnd.join('|') + ')'
        , 'ig');
    captureLeadingOr = new RegExp(
        '^(' + Utils.tokensOr.join('|') + ')'
        , 'ig');
    captureLeadingXor = new RegExp(
        '^(' + Utils.tokensXor.join('|') + ')'
        , 'ig');
    leadingAndMatch;
    leadingOrMatch;
    leadingXorMatch;
    retVal;
    ignoredText;

    hasMixedOperators;
    truePaths;
    falsePaths;

    constructor(private text: string) {

        this.textToParse = Utils.trimParenthesisPairs(this.text);
        this.topLevelParenthesis = Utils.findTopLevelParenthesis(this.textToParse);
        // Break the text into sub-expressions and top-level expressions
        // TODO: Identify when a ! precedes an Expression, and pass that into the constructor
        if (this.topLevelParenthesis.length === 0) {
            // There are no sub-expressions to extract.  Store the entire string
            this.textChunks.push(this.textToParse);
        } else {

            this.topLevelParenthesis.forEach((e) => {
                // Store the text between previous chunk and start of this Expression
                this.textChunks.push(this.textToParse.substring(this.lastPosition, e.start));
                // Store the sub-expression
                this.textChunks.push(new Expression(this.textToParse.substring(e.start, e.end + 1)));
                // Advance the pointer
                this.lastPosition = e.end + 1;
            });

            // Store any trailing text
            if (this.lastPosition < this.textToParse.length - 1) {
                this.textChunks.push(this.textToParse.substring(this.lastPosition));
            }

        }

        // TODO: Identify when the condition is preceded by a ! or has a negative comparison
        this.textChunks.forEach((textChunk) => {
            // If this chunk is a sub-expression, just store it without parsing
            if (textChunk instanceof Expression) {
                this.conditions.push(textChunk);
            } else {
                // Remove all the text that should be ignored: the contents of function calls and strings
                // Otherwise the split() could match operators in those strings
                const retVal = Utils.removeIgnoredText(textChunk);
                textChunk = retVal[0];
                this.ignoredText = retVal[1];

                this.conditionChunks = textChunk.split(this.matchAndOrXor);

                this.conditionChunks.forEach((condition) => {
                    // Determine if an AND operator or an OR operator was found.
                    // If so, store which was found and then remove it.
                    if ((this.leadingAndMatch = condition.match(this.captureLeadingAnd)) !== null) {
                        this.operators.push(new Operator(COND_TYPE.TYPE_AND));
                        condition = condition.substring(this.leadingAndMatch[0].length);
                    } else if ((this.leadingOrMatch = condition.match(this.captureLeadingOr)) !== null) {
                        this.operators.push(new Operator(COND_TYPE.TYPE_OR));
                        condition = condition.substring(this.leadingOrMatch[0].length);
                    } else if ((this.leadingXorMatch = condition.match(this.captureLeadingXor)) !== null) {
                        this.operators.push(new Operator(COND_TYPE.TYPE_XOR));
                        condition = condition.substring(this.leadingXorMatch[0].length);
                    }

                    // Store anything that's not still empty.
                    condition = condition.trim();
                    if (condition !== '') {
                        // Restore any text that was ignored above
                        condition = Utils.restoreIgnoredText(condition, this.ignoredText);
                        this.conditions.push(new Condition(condition));
                    }
                });

            }
        });

        this.hasMixedOperators = Utils.hasMixedOperators(this.operators);
        this.truePaths = this.hasMixedOperators ? null : new EvalTree(this, true);
        this.falsePaths = this.hasMixedOperators ? null : new EvalTree(this, false);

    }

    getEvalPaths(treeType) {
        return treeType ? this.truePaths : this.falsePaths;
    }

    hasMixedOperatorsDeep() {

        return this.hasMixedOperators || this.conditions.some( (c) => {
                return (c instanceof Expression) && c.hasMixedOperatorsDeep();
            });
    }
}

