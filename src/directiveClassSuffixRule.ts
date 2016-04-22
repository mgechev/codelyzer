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

    static FAILURE:string = "The name of the class %s should end with the suffix Directive";

    static validate(className:string):boolean {
        return /.*Directive/.test(className);
    }
}

export class ClassMetadataWalker extends Lint.RuleWalker {

    visitClassDeclaration(node:ts.ClassDeclaration) {
        let decorators = node.decorators;
        if (decorators) {
            let components:Array<string> = decorators.map(d=>(<any>d.expression).expression.text).filter(t=>t === 'Directive');
            if (components.length !== 0) {
                let name = node.name;
                let className:string = name.text;
                if (!Rule.validate(className)) {
                    this.addFailure(
                        this.createFailure(
                            name.getStart(),
                            name.getWidth(),
                            sprintf.apply(this, [Rule.FAILURE, className])));
                }
            }
        }
        super.visitClassDeclaration(node);
    }

}
