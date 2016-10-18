import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';
import {sprintf} from 'sprintf-js';
import * as compiler from "@angular/compiler";

import SyntaxKind = require('./util/syntaxKind');

export enum COMPONENT_TYPE {
  COMPONENT,
  DIRECTIVE,
  ANY
};

export abstract class SelectorRule extends Lint.Rules.AbstractRule {
  constructor(ruleName: string, value: any, disabledIntervals: Lint.IDisabledInterval[],
    private validator: Function, private failureString: string, private target: COMPONENT_TYPE = COMPONENT_TYPE.ANY) {
    super(ruleName, value, disabledIntervals);
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    let documentRegistry = ts.createDocumentRegistry();
    let languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
    let languageService : ts.LanguageService = ts.createLanguageService(languageServiceHost, documentRegistry);
    return this.applyWithWalker(
      new SelectorNameValidatorWalker(
        sourceFile,
        languageService,
        this));
  }

  public getFailureString(failureConfig): string {
    return sprintf(this.failureString, failureConfig.className, this.getOptions().ruleArguments, failureConfig.selector);
  }

  public validate(selector: string): boolean {
    return this.validator(selector);
  }

  public get targetType(): COMPONENT_TYPE {
    return this.target;
  }
}

class SelectorNameValidatorWalker extends Lint.RuleWalker {
  private languageService : ts.LanguageService;
  private typeChecker : ts.TypeChecker;

  constructor(sourceFile: ts.SourceFile, languageService : ts.LanguageService, private rule: SelectorRule) {
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

    if (this.rule.targetType === COMPONENT_TYPE.ANY ||
        name === 'Component' && this.rule.targetType === COMPONENT_TYPE.COMPONENT ||
        name === 'Directive' && this.rule.targetType === COMPONENT_TYPE.DIRECTIVE) {
      this.validateSelector(className, arg,name);
    }
  }

  private validateSelector(className: string, arg: ts.Node,name:string) {
    if (arg.kind === SyntaxKind.current().ObjectLiteralExpression) {
      (<ts.ObjectLiteralExpression>arg).properties.filter(prop => (<any>prop.name).text === 'selector')
      .forEach(prop => {
        let p = <any>prop;
        if (!this.validateParsedSelector(p,name)) {
          console.log("1");
          const FAILURE_COMPONENT = 'The selector of the component "%s" should be used as %s ($$05-03$$)';
          const FAILURE_DIRECTIVE = 'The selector of the directive "%s" should be used as %s ($$02-06$$)';
          let FAILURE:string = name==='Component'?FAILURE_COMPONENT:FAILURE_DIRECTIVE;
          if(this.isSupportedKind(p.initializer.kind)){
            let error = sprintf(FAILURE, className, this.rule.getOptions().ruleArguments, p.initializer.text);
            this.addFailure(this.createFailure(p.initializer.getStart(), p.initializer.getWidth(),error));
          }
        }else if(name === 'Component' && !this.rule.validate(this.extractMainSelector(p,name))){
            console.log("2");
            let error = this.rule.getFailureString({ selector: this.extractMainSelector(p,name), className });
            this.addFailure(this.createFailure(p.initializer.getStart(), p.initializer.getWidth(), error));
        }
        else if(name ==='Directive' && !(this.extractMainSelector(p,name).some((a)=>this.rule.validate(a)))){
            console.log("3");
            let error = this.rule.getFailureString({ selector: this.extractMainSelector(p,name), className });
            this.addFailure(this.createFailure(p.initializer.getStart(), p.initializer.getWidth(), error));
        }else{
          console.log("4");
        }
      });
    }
  }

  private isSupportedKind(kind: number): boolean {
    const current = SyntaxKind.current();
    return [current.StringLiteral, current.NoSubstitutionTemplateLiteral].some(kindType => kindType === kind)
  }

  private parse(text:string):any{
    return compiler.__compiler_private__.CssSelector.parse(text)[0];
  }

  private validateParsedSelector(p:any,name:string):boolean{
    return p.initializer && this.isSupportedKind(p.initializer.kind) &&
        ((name === 'Component' &&  this.parse(p.initializer.text).element!=null) ||
        (name === 'Directive' && this.parse(p.initializer.text).attrs.length!=0));
  }

  private extractMainSelector(p:any,name:string){
    if(name === 'Component'){
      return  this.parse(p.initializer.text).element;
    }else if(name==='Directive'){
      return this.parse(p.initializer.text).attrs;
    }
    return null;
  }
}

