import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';

export class Rule extends Lint.Rules.AbstractRule {

    public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
        return this.applyWithWalker(
            new ExpressionCallMetadataWalker(sourceFile,
                this.getOptions()));
    }

    static FAILURE_STRING:string = 'In the class "%s" you are calling forwardRef,' +
        ' which is considered a bad practice ' +
        'and indicates either a cyclic dependency or ' +
        'inconsistency in the services declaration';
}


export class ExpressionCallMetadataWalker extends Lint.RuleWalker {

    visitCallExpression(node:ts.CallExpression) {
        this.validateCallExpression(node);
        super.visitCallExpression(node);
    }

    private validateCallExpression(callExpression) {
        if (callExpression.expression.text === 'forwardRef') {
            let currentNode:any = callExpression;
            while (currentNode.parent.parent) {
                currentNode = currentNode.parent;
            }
            let failureConfig:string[] = [currentNode.name.text];
            failureConfig.unshift(Rule.FAILURE_STRING);
            this.addFailure(
                this.createFailure(
                    callExpression.getStart(),
                    callExpression.getWidth(),
                    sprintf.apply(this, failureConfig)));
        }
    }

}