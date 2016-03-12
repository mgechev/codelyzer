import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import {Ng2Walker} from "./util/ng2Walker";

export class Rule extends Lint.Rules.AbstractRule {

    public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
        return this.applyWithWalker(
            new InputMetadataWalker(sourceFile,
                this.getOptions()));
    }

    static FAILURE_STRING:string = 'In the class "%s", the directive ' +
        'input property "%s" should not be renamed.' +
        'Please, consider the following use "@Input() %s: string"';
}


export class InputMetadataWalker extends Ng2Walker {

    visitNg2Input(property:ts.PropertyDeclaration, input:ts.Decorator, args:string[]) {
        let className = (<any>property).parent.name.text;
        let memberName = (<any>property.name).text;
        if (args.length != 0 && memberName != args[0]) {
            let failureConfig:string[] = [className, memberName, memberName];
            failureConfig.unshift(Rule.FAILURE_STRING);
            this.addFailure(
                this.createFailure(
                    property.getStart(),
                    property.getWidth(),
                    sprintf.apply(this, failureConfig)));
        }
    }
}