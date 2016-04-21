import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import SyntaxKind = require('./util/syntaxKind');

export class Rule extends Lint.Rules.AbstractRule {

    public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
        return this.applyWithWalker(
            new ClassMetadataWalker(sourceFile,
                this.getOptions()));
    }

    static DECORATORS:string[] = ['Component', 'Directive', 'Pipe', 'Injectable'];
    static FAILURE:string = 'In the class "%s" no valid decorator is used. Probably you should use the @Injectable decorator';
}

export class ClassMetadataWalker extends Lint.RuleWalker {

    visitClassDeclaration(node:ts.ClassDeclaration) {
        let decorators = node.decorators;
        let className:string = node.name.text;
        if (!this.areValidDecorators(decorators)) {
            this.addFailure(
                this.createFailure(
                    node.getStart(),
                    node.getWidth(),
                    sprintf.apply(this, [Rule.FAILURE, className])));
        }
        super.visitClassDeclaration(node);
    }

    private areValidDecorators(decorators:Array<any>):boolean {
        if (!decorators)return false;
        let hasValid:boolean=false;
        decorators.forEach(d=> {
            let baseExpr = <any>d.expression;
            let expr = baseExpr.expression;
            if(Rule.DECORATORS.indexOf(expr.text) !==-1){
                hasValid=true;
            }
        });
        return hasValid;
    }
}
