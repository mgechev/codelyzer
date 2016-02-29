import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';

export class ClassParameterRule extends Lint.Rules.AbstractRule {

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[], private validator:Function,
                private errorMessage:string) {
        super(ruleName, value, disabledIntervals);
    }

    public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
        let documentRegistry = ts.createDocumentRegistry();
        let languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
        let languageService:ts.LanguageService = ts.createLanguageService(languageServiceHost, documentRegistry);
        return this.applyWithWalker(
            new ClassMetadataWalker(
                sourceFile,
                languageService,
                this));
    }

    public validate(parameter:ts.ParameterDeclaration) {
        return this.validator(parameter);
    }

    public getFailureString(failureConfig) {
        return sprintf(this.errorMessage, failureConfig.className, failureConfig.memberName, failureConfig.memberName);
    }
}

export class ClassMetadataWalker extends Lint.RuleWalker {

    private languageService:ts.LanguageService;
    private typeChecker:ts.TypeChecker;

    constructor(sourceFile:ts.SourceFile, languageService:ts.LanguageService, private rule:ClassParameterRule) {
        super(sourceFile, rule.getOptions());
        this.languageService = languageService;
        this.typeChecker = languageService.getProgram().getTypeChecker();
    }

    visitClassDeclaration(node:ts.ClassDeclaration) {
        (node.members || []).forEach(this.validateClassMember.bind(this, node.name.text));
        super.visitClassDeclaration(node);
    }

    validateClassMember(className:string, member) {
        if (!this.rule.validate(member)) {
            let memberName = member.name.text;
            this.addFailure(
                this.createFailure(
                    member.getStart(),
                    member.getWidth(),
                    this.rule.getFailureString({className, memberName})));
        }
    }
}