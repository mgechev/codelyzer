import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import {RuleBase} from "./util/rulesBase";

export class ConstructorMetadataWalker extends Lint.RuleWalker {

    private languageService:ts.LanguageService;
    private typeChecker:ts.TypeChecker;

    constructor(sourceFile:ts.SourceFile, languageService:ts.LanguageService, private rule:RuleBase) {
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
                    this.rule.getFailureString([className, parameterName, parameterName])));
        }
    }

}