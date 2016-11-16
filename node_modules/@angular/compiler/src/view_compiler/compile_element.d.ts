/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompileDirectiveSummary, CompileTokenMetadata } from '../compile_metadata';
import * as o from '../output/output_ast';
import { ProviderAst, ReferenceAst, TemplateAst } from '../template_parser/template_ast';
import { CompileView, CompileViewRootNode } from './compile_view';
import { ComponentFactoryDependency, DirectiveWrapperDependency, ViewClassDependency } from './deps';
export declare class CompileNode {
    parent: CompileElement;
    view: CompileView;
    nodeIndex: number;
    renderNode: o.Expression;
    sourceAst: TemplateAst;
    constructor(parent: CompileElement, view: CompileView, nodeIndex: number, renderNode: o.Expression, sourceAst: TemplateAst);
    isNull(): boolean;
    isRootElement(): boolean;
}
export declare class CompileElement extends CompileNode {
    component: CompileDirectiveSummary;
    private _directives;
    private _resolvedProvidersArray;
    hasViewContainer: boolean;
    hasEmbeddedView: boolean;
    private _targetDependencies;
    static createNull(): CompileElement;
    compViewExpr: o.Expression;
    viewContainer: o.ReadPropExpr;
    elementRef: o.Expression;
    instances: Map<any, o.Expression>;
    directiveWrapperInstance: Map<any, o.Expression>;
    private _resolvedProviders;
    private _queryCount;
    private _queries;
    contentNodesByNgContentIndex: Array<CompileViewRootNode>[];
    embeddedView: CompileView;
    referenceTokens: {
        [key: string]: CompileTokenMetadata;
    };
    constructor(parent: CompileElement, view: CompileView, nodeIndex: number, renderNode: o.Expression, sourceAst: TemplateAst, component: CompileDirectiveSummary, _directives: CompileDirectiveSummary[], _resolvedProvidersArray: ProviderAst[], hasViewContainer: boolean, hasEmbeddedView: boolean, references: ReferenceAst[], _targetDependencies: Array<ViewClassDependency | ComponentFactoryDependency | DirectiveWrapperDependency>);
    private _createViewContainer();
    private _createComponentFactoryResolver();
    setComponentView(compViewExpr: o.Expression): void;
    setEmbeddedView(embeddedView: CompileView): void;
    beforeChildren(): void;
    afterChildren(childNodeCount: number): void;
    addContentNode(ngContentIndex: number, nodeExpr: CompileViewRootNode): void;
    getComponent(): o.Expression;
    getProviderTokens(): o.Expression[];
    private _getQueriesFor(token);
    private _addQuery(queryMeta, directiveInstance);
    private _getLocalDependency(requestingProviderType, dep);
    private _getDependency(requestingProviderType, dep);
}
