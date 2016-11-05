import * as Lint from 'tslint/lib/lint';
import {SelectorValidator} from './util/selectorValidator';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import * as compiler from "@angular/compiler";
import SyntaxKind = require('./util/syntaxKind');

const FAILURE_TYPE = 'The selector of the directive "%s" should be used as %s ($$02-06$$)';
const FAILURE_NAME = 'The selector of the directive "%s" should be named %s ($$02-06$$)';
const FAILURE_PREFIX_SINGLE = 'The selector of the directive "%s" should have prefix "%s" ($$02-08$$)';
const FAILURE_PREFIX_MANY = 'The selector of the directive "%s" should have one of the prefixes: %s ($$02-08$$)';

export class Rule extends Lint.Rules.AbstractRule {

    private prefixValidator:Function;
    private nameValidator:Function;
    public FAILURE_PREFIX;
    public isMultiPrefix:boolean;
    public prefixArguments:string;

    constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[]) {
        let prefix = value[2];
        let name = value[3];
        super(ruleName, value, disabledIntervals);
        this.setMultiPrefix(prefix);
        this.setPrefixArguments(prefix);
        this.setPrefixValidator(prefix);
        this.setPrefixFailure();
        if (name === 'camelCase') {
            this.nameValidator = SelectorValidator.camelCase;
        }
    }

    private setMultiPrefix(prefix:string){
        this.isMultiPrefix = typeof prefix==='string';
    }

    private setPrefixArguments(prefix:any){
        this.prefixArguments = this.isMultiPrefix?prefix:prefix.join(',');
    }

    private setPrefixValidator(prefix:any){
        let prefixExpression: string = this.isMultiPrefix?prefix:(prefix||[]).join('|');
        this.prefixValidator = SelectorValidator.multiPrefix(prefixExpression);
    }

    private setPrefixFailure(){
        this.FAILURE_PREFIX = this.isMultiPrefix?FAILURE_PREFIX_SINGLE:FAILURE_PREFIX_MANY;
    }

    public validateName(attrs:string[]):boolean {
        return attrs.some((a)=>this.nameValidator(a));
    }

    public validatePrefix(attrs:string[]):boolean {
        return attrs.some((a)=>this.prefixValidator(a));
    }

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        let documentRegistry = ts.createDocumentRegistry();
        let languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
        let languageService : ts.LanguageService = ts.createLanguageService(languageServiceHost, documentRegistry);
        return this.applyWithWalker(
            new SelectorValidatorWalker(
                sourceFile,
                languageService,
                this));
    }

    public getFailureString(failureConfig): string {
        return sprintf(failureConfig.fail, failureConfig.className, this.getOptions().ruleArguments, failureConfig.selector);
    }

}

class SelectorValidatorWalker extends Lint.RuleWalker {
    private languageService : ts.LanguageService;
    private typeChecker : ts.TypeChecker;

    constructor(sourceFile: ts.SourceFile, languageService : ts.LanguageService, private rule: Rule) {
        super(sourceFile, rule.getOptions());
        this.languageService = languageService;
        this.typeChecker = languageService.getProgram().getTypeChecker();
    }

    visitClassDeclaration(node: ts.ClassDeclaration) {
        (<ts.Decorator[]>node.decorators || [])
            .forEach(this.validateDecorator.bind(this, node.name.text));
        super.visitClassDeclaration(node);
    }

    private validateDecorator(className: string, decorator: ts.Decorator) {
        let baseExpr = <any>decorator.expression || {};
        let expr = baseExpr.expression || {};
        let name = expr.text;
        let args = baseExpr.arguments || [];
        let arg = args[0];
        if (name === 'Directive') {
            this.validateSelector(className, arg);
        }
    }

    private validateSelector(className: string, arg: ts.Node) {
        if (arg.kind === SyntaxKind.current().ObjectLiteralExpression) {
            (<ts.ObjectLiteralExpression>arg).properties.filter(prop => (<any>prop.name).text === 'selector')
                .forEach(prop => {
                    let p = <any>prop;
                    if (!this.validateParsedSelector(p)) {
                        if(this.isSupportedKind(p.initializer.kind)) {
                            let error = sprintf(FAILURE_TYPE, className,this.rule.getOptions().ruleArguments[0]);
                            this.addFailure(this.createFailure(p.initializer.getStart(), p.initializer.getWidth(),error));
                        }
                    }else if(!this.rule.validateName(this.extractMainSelector(p))) {
                        let error = sprintf(FAILURE_NAME,className,this.rule.getOptions().ruleArguments[2]);
                        this.addFailure(this.createFailure(p.initializer.getStart(), p.initializer.getWidth(), error));
                    }else if(!this.rule.validatePrefix(this.extractMainSelector(p))) {
                        let error = sprintf(this.rule.FAILURE_PREFIX,className,this.rule.prefixArguments);
                        this.addFailure(this.createFailure(p.initializer.getStart(), p.initializer.getWidth(), error));
                    }
                });
        }
    }

    private isSupportedKind(kind: number): boolean {
        const current = SyntaxKind.current();
        return [current.StringLiteral, current.NoSubstitutionTemplateLiteral].some(kindType => kindType === kind)
    }

    private parse(text:string):any {
        return compiler.CssSelector.parse(text)[0];
    }

    private validateParsedSelector(p:any):boolean {
        return p.initializer && this.isSupportedKind(p.initializer.kind) &&
            this.parse(p.initializer.text).attrs.length!=0;
    }

    private extractMainSelector(p:any) {
        return  this.parse(p.initializer.text).attrs;
    }
}


