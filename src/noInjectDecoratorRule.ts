import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';

export class Rule extends Lint.Rules.AbstractRule {

    public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
        return this.applyWithWalker(
            new ConstructorMetadataWalker(sourceFile,
                this.getOptions()));
    }

    static  FAILURE_STRING:string = 'In the constructor of class "%s", ' +
        'the parameter "%s" uses the @Inject decorator, which is considered a bad practice.' +
        ' Please, declare the injected class with the @Injectable decorator';

}

export class ConstructorMetadataWalker extends Lint.RuleWalker {

    visitConstructorDeclaration(node:ts.ConstructorDeclaration) {
        let parentName = (<ts.ClassDeclaration>node.parent).name.text;
        (node.parameters || []).forEach(this.validateParameter.bind(this, parentName));
        super.visitConstructorDeclaration(node);
    }

    validateParameter(className:string, parameter) {
        let parameterName = (<ts.Identifier>parameter.name).text;
        if (parameter.decorators) {
            parameter.decorators.forEach((decorator)=> {
                let baseExpr = <any>decorator.expression || {};
                let expr = baseExpr.expression || {};
                let name = expr.text;
                if (name == 'Inject') {
                    let failureConfig:string[] = [Rule.FAILURE_STRING,
                        className, parameterName];
                    this.addFailure(
                        this.createFailure(
                            parameter.getStart(),
                            parameter.getWidth(),
                            sprintf.apply(this, failureConfig)));
                }
            })
        }
    }
}