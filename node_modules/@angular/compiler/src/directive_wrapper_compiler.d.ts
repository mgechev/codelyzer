import { CompileDirectiveMetadata, CompileDirectiveSummary, CompileIdentifierMetadata } from './compile_metadata';
import { CompilerConfig } from './config';
import { Parser } from './expression_parser/parser';
import * as o from './output/output_ast';
import { Console } from './private_import_core';
import { ElementSchemaRegistry } from './schema/element_schema_registry';
import { BoundElementPropertyAst, BoundEventAst } from './template_parser/template_ast';
export declare class DirectiveWrapperCompileResult {
    statements: o.Statement[];
    dirWrapperClassVar: string;
    constructor(statements: o.Statement[], dirWrapperClassVar: string);
}
/**
 * We generate directive wrappers to prevent code bloat when a directive is used.
 * A directive wrapper encapsulates
 * the dirty checking for `@Input`, the handling of `@HostListener` / `@HostBinding`
 * and calling the lifecyclehooks `ngOnInit`, `ngOnChanges`, `ngDoCheck`.
 *
 * So far, only `@Input` and the lifecycle hooks have been implemented.
 */
export declare class DirectiveWrapperCompiler {
    private compilerConfig;
    private _exprParser;
    private _schemaRegistry;
    private _console;
    static dirWrapperClassName(id: CompileIdentifierMetadata): string;
    constructor(compilerConfig: CompilerConfig, _exprParser: Parser, _schemaRegistry: ElementSchemaRegistry, _console: Console);
    compile(dirMeta: CompileDirectiveMetadata): DirectiveWrapperCompileResult;
}
export declare class DirectiveWrapperExpressions {
    static create(dir: CompileIdentifierMetadata, depsExpr: o.Expression[]): o.Expression;
    static context(dirWrapper: o.Expression): o.ReadPropExpr;
    static ngDoCheck(dirWrapper: o.Expression, view: o.Expression, renderElement: o.Expression, throwOnChange: o.Expression): o.Expression;
    static checkHost(hostProps: BoundElementPropertyAst[], dirWrapper: o.Expression, view: o.Expression, componentView: o.Expression, renderElement: o.Expression, throwOnChange: o.Expression, runtimeSecurityContexts: o.Expression[]): o.Statement[];
    static ngOnDetach(hostProps: BoundElementPropertyAst[], dirWrapper: o.Expression, view: o.Expression, componentView: o.Expression, renderEl: o.Expression): o.Statement[];
    static ngOnDestroy(dir: CompileDirectiveSummary, dirWrapper: o.Expression): o.Statement[];
    static subscribe(dirMeta: CompileDirectiveSummary, hostProps: BoundElementPropertyAst[], usedEvents: string[], dirWrapper: o.Expression, view: o.Expression, eventListener: o.Expression): o.Statement[];
    static handleEvent(hostEvents: BoundEventAst[], dirWrapper: o.Expression, eventName: o.Expression, event: o.Expression): o.Expression;
}
