import * as o from '../output/output_ast';
import { BoundElementPropertyAst } from '../template_parser/template_ast';
export declare function writeToRenderer(view: o.Expression, boundProp: BoundElementPropertyAst, renderElement: o.Expression, renderValue: o.Expression, logBindingUpdate: boolean, securityContextExpression?: o.Expression): o.Statement[];
export declare function triggerAnimation(view: o.Expression, componentView: o.Expression, boundProp: BoundElementPropertyAst, eventListener: o.Expression, renderElement: o.Expression, renderValue: o.Expression, lastRenderValue: o.Expression): {
    updateStmts: o.Statement[];
    detachStmts: o.Statement[];
};
