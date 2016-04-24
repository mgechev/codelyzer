import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import {Ng2Walker} from "./util/ng2Walker";

export class Rule extends Lint.Rules.AbstractRule {

    public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
        return this.applyWithWalker(
            new OutputMetadataWalker(sourceFile,
                this.getOptions()));
    }

    static FAILURE_STRING:string = 'In the class "%s", the directive output ' +
        'property "%s" should not be renamed.' +
        'Please, consider the following use "@Output() %s = new EventEmitter();"';
}


export class OutputMetadataWalker extends Ng2Walker {

    visitNg2Output(property:ts.PropertyDeclaration, output:ts.Decorator, args:string[]) {
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