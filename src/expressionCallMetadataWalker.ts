import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import {RuleBase} from "./util/rulesBase";

export class ExpressionCallMetadataWalker extends Lint.RuleWalker {
    private languageService:ts.LanguageService;
    private typeChecker:ts.TypeChecker;

    constructor(sourceFile:ts.SourceFile, languageService:ts.LanguageService, private rule:RuleBase) {
        super(sourceFile, rule.getOptions());
        this.languageService = languageService;
        this.typeChecker = languageService.getProgram().getTypeChecker();
    }

    visitCallExpression(node:ts.CallExpression) {
        this.validateCallExpression(node);
        super.visitCallExpression(node);
    }

    private validateCallExpression(callExpression) {
        if (this.rule.validate(callExpression)) {
            let currentNode:any = callExpression;
            while (currentNode.parent.parent) {
                currentNode = currentNode.parent;
            }
            this.addFailure(
                this.createFailure(
                    callExpression.getStart(),
                    callExpression.getWidth(),
                    this.rule.getFailureString([currentNode.name.text])));
        }
    }

}