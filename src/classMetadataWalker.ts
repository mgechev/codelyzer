import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import {RuleBase} from "./util/rulesBase";

export class ClassMetadataWalker extends Lint.RuleWalker {

    private languageService:ts.LanguageService;
    private typeChecker:ts.TypeChecker;

    constructor(sourceFile:ts.SourceFile, languageService:ts.LanguageService, private rule:RuleBase) {
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
                    this.rule.getFailureString([className, memberName, memberName])));
        }
    }
}