import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';

export class ConstructorRule extends Lint.Rules.AbstractRule {

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[], private validator:Function,
                private errorMessage:string) {
        super(ruleName, value, disabledIntervals);
    }

    public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
        let documentRegistry = ts.createDocumentRegistry();
        let languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
        let languageService:ts.LanguageService = ts.createLanguageService(languageServiceHost, documentRegistry);
        return this.applyWithWalker(
            new ConstructorMetadataWalker(
                sourceFile,
                languageService,
                this));
    }

    public validate(parameter:ts.ParameterDeclaration) {
        return this.validator(parameter);
    }

    public getFailureString(failureConfig) {
        return sprintf(this.errorMessage, failureConfig.className, failureConfig.parameterName, failureConfig.parameterName);
    }
}

export class ConstructorMetadataWalker extends Lint.RuleWalker {

    private languageService:ts.LanguageService;
    private typeChecker:ts.TypeChecker;

    constructor(sourceFile:ts.SourceFile, languageService:ts.LanguageService, private rule:ConstructorRule) {
        super(sourceFile, rule.getOptions());
        this.languageService = languageService;
        this.typeChecker = languageService.getProgram().getTypeChecker();
    }

    visitConstructorDeclaration(node:ts.ConstructorDeclaration) {
        let parentName = (<ts.ClassDeclaration>node.parent).name.text;
        (node.parameters || []).forEach(this.validateParameter.bind(this, parentName));
        super.visitConstructorDeclaration(node);
    }

    validateParameter(className:string, parameter:ts.ParameterDeclaration) {
        let parameterName = (<ts.Identifier>parameter.name).text;
        if (!this.rule.validate(parameter)) {
            this.addFailure(
                this.createFailure(
                    parameter.getStart(),
                    parameter.getWidth(),
                    this.rule.getFailureString({className, parameterName})));
        }
    }

}