import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import * as compiler from '@angular/compiler';
import { CssAst } from './styles/cssAst';
import { CssAstVisitorCtrl } from './styles/basicCssAstVisitor';
import { RecursiveAngularExpressionVisitorCtr, TemplateAstVisitorCtr } from './templates/basicTemplateAstVisitor';
export interface Ng2WalkerConfig {
    expressionVisitorCtrl?: RecursiveAngularExpressionVisitorCtr;
    templateVisitorCtrl?: TemplateAstVisitorCtr;
    cssVisitorCtrl?: CssAstVisitorCtrl;
}
export declare class Ng2Walker extends Lint.RuleWalker {
    protected _originalOptions: Lint.IOptions;
    private _config;
    constructor(sourceFile: ts.SourceFile, _originalOptions: Lint.IOptions, _config?: Ng2WalkerConfig);
    visitClassDeclaration(declaration: ts.ClassDeclaration): void;
    visitMethodDeclaration(method: ts.MethodDeclaration): void;
    visitPropertyDeclaration(prop: ts.PropertyDeclaration): void;
    protected visitMethodDecorator(decorator: ts.Decorator): void;
    protected visitPropertyDecorator(decorator: ts.Decorator): void;
    protected visitClassDecorator(decorator: ts.Decorator): void;
    protected visitNg2Component(controller: ts.ClassDeclaration, decorator: ts.Decorator): void;
    protected visitNg2Directive(controller: ts.ClassDeclaration, decorator: ts.Decorator): void;
    protected visitNg2Pipe(controller: ts.ClassDeclaration, decorator: ts.Decorator): void;
    protected visitNg2Input(property: ts.PropertyDeclaration, input: ts.Decorator, args: string[]): void;
    protected visitNg2Output(property: ts.PropertyDeclaration, output: ts.Decorator, args: string[]): void;
    protected visitNg2HostBinding(property: ts.PropertyDeclaration, decorator: ts.Decorator, args: string[]): void;
    protected visitNg2HostListener(method: ts.MethodDeclaration, decorator: ts.Decorator, args: string[]): void;
    protected visitNg2TemplateHelper(roots: compiler.TemplateAst[], context: ts.ClassDeclaration, baseStart: number): void;
    protected visitNg2StyleHelper(style: CssAst, context: ts.ClassDeclaration, baseStart: number): void;
    private _normalizeConfig(config?);
}
