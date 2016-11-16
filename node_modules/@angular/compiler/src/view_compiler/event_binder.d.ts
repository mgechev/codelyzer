import { BoundEventAst, DirectiveAst } from '../template_parser/template_ast';
import { CompileElement } from './compile_element';
export declare function bindOutputs(boundEvents: BoundEventAst[], directives: DirectiveAst[], compileElement: CompileElement, bindToRenderer: boolean): boolean;
