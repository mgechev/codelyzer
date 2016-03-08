import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';

export class ExpressionCallRule extends Lint.Rules.AbstractRule{

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[], private validator:Function,
                private errorMessage:string) {
        super(ruleName, value, disabledIntervals);
    }

    public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
        let documentRegistry = ts.createDocumentRegistry();
        let languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
        let languageService:ts.LanguageService = ts.createLanguageService(languageServiceHost, documentRegistry);
        return this.applyWithWalker(
            new ExpressionCallMetadataWalker(
                sourceFile,
                languageService,
                this));
    }

    public validate(callExpression:ts.CallExpression) {
        return this.validator(callExpression);
    }

    public getFailureString(failureClass) {
        return sprintf(this.errorMessage, failureClass);
    }
}

export class ExpressionCallMetadataWalker extends Lint.RuleWalker{
    private languageService:ts.LanguageService;
    private typeChecker:ts.TypeChecker;

    constructor(sourceFile:ts.SourceFile, languageService:ts.LanguageService, private rule:ExpressionCallRule) {
        super(sourceFile, rule.getOptions());
        this.languageService = languageService;
        this.typeChecker = languageService.getProgram().getTypeChecker();
    }

    visitCallExpression(node: ts.CallExpression) {
        this.validateCallExpression(node);
        super.visitCallExpression(node);
    }

    private validateCallExpression(callExpression) {
        if(this.rule.validate(callExpression)){
            let currentNode:any = callExpression;
            while(currentNode.parent.parent){
                currentNode = currentNode.parent;
            }
            this.addFailure(
                this.createFailure(
                    callExpression.getStart(),
                    callExpression.getWidth(),
                    this.rule.getFailureString(currentNode.name.text)));
        }
    }

}