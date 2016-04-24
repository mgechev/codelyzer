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

    static  FAILURE_SINGLE:string = 'In class %s the method %s is a life cycle hook' +
        ' and should implement the %s interface';

    static FAILURE_MANY = 'In class %s the methods - %s' +
        ' are life cycle hooks and should implement the interfaces: %s';

    static HOOKS_PREFIX = 'ng';

    static LIFE_CYCLE_HOOKS_NAMES:Array<any> = [
        "OnChanges",
        "OnInit",
        "DoCheck",
        "AfterContentInit",
        "AfterContentChecked",
        "AfterViewInit",
        "AfterViewChecked",
        "OnDestroy"
    ]

}

export class ClassMetadataWalker extends Lint.RuleWalker {

    visitClassDeclaration(node:ts.ClassDeclaration) {
        let syntaxKind = SyntaxKind.current();
        let className = node.name.text;

        let interfaces = [];
        if (node.heritageClauses) {
            let interfacesClause = node.heritageClauses.filter(h=>h.token === syntaxKind.ImplementsKeyword);
            if (interfacesClause.length !== 0) {
                interfaces = interfacesClause[0].types.map(t=>(<any>t.expression).text);
            }
        }

        let missing:Array<string> = this.extractMissing(node.members, syntaxKind, interfaces);

        if (missing.length !== 0) {
            this.addFailure(
                this.createFailure(
                    node.getStart(),
                    node.getWidth(),
                    sprintf.apply(this, this.formatFailure(className, missing))));
        }
        super.visitClassDeclaration(node);
    }


    private extractMissing(members:ts.NodeArray<ts.ClassElement>,
                           syntaxKind:SyntaxKind.SyntaxKind,
                           interfaces:Array<string>):Array<string> {
        let ngMembers = members.filter(m=>m.kind === syntaxKind.MethodDeclaration)
            .map(m=>(<any>m.name).text)
            .filter(n=>n.substr(0, 2) === Rule.HOOKS_PREFIX)
            .map(n=>n.substr(2, n.lenght))
            .filter(n=>Rule.LIFE_CYCLE_HOOKS_NAMES.indexOf(n) !== -1);
        return ngMembers.filter(m=>interfaces.indexOf(m) === -1);
    }

    private formatFailure(className:string, missing:Array<string>):Array<string> {
        let failureConfig:Array<string>;
        if (missing.length === 1) {
            failureConfig = [Rule.FAILURE_SINGLE, className, Rule.HOOKS_PREFIX + missing[0], missing[0]];
        } else {
            let joinedNgMissing:string = missing.map(m=>Rule.HOOKS_PREFIX + m).join(', ');
            let joinedMissingInterfaces = missing.join(', ');
            failureConfig = [Rule.FAILURE_MANY, className, joinedNgMissing, joinedMissingInterfaces];
        }
        return failureConfig;
    }
}
