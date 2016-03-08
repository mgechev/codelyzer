import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';

interface IWalker{
    new (sourceFile:ts.SourceFile, languageService:ts.LanguageService, rule):Lint.RuleWalker;
}

export class RuleBase extends Lint.Rules.AbstractRule {

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[], private validator:Function,
                private errorMessage:string, private Walker:IWalker) {
        super(ruleName, value, disabledIntervals);
    }

    public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
        let documentRegistry = ts.createDocumentRegistry();
        let languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
        let languageService:ts.LanguageService = ts.createLanguageService(languageServiceHost, documentRegistry);
        let walker = new this.Walker(sourceFile, languageService, this);
        return this.applyWithWalker(walker);
    }

    public validate(parameter:ts.ParameterDeclaration) {
        return this.validator(parameter);
    }

    public getFailureString(failureConfig:string[]) {
        failureConfig.unshift(this.errorMessage);
        return sprintf.apply(this, failureConfig);
    }
}