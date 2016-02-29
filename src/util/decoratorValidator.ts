export const decoratorValidator = (condition)=> {
    return function (element) {
        let isValid:boolean = true;
        if (element.decorators) {
            element.decorators.forEach((decorator)=> {
                let baseExpr = <any>decorator.expression || {};
                let expr = baseExpr.expression || {};
                let name = expr.text;
                let args = baseExpr.arguments || [];
                let arg = args[0];
                if (condition(name, arg)) {
                    isValid = false;
                }
            })
        }
        return isValid;
    }
};