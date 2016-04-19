import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import SyntaxKind = require('./util/syntaxKind');
import {SelectorValidator} from "./util/selectorValidator";

export class Rule extends Lint.Rules.AbstractRule {


    public prefix:string;
    public hasPrefix:boolean;
    private prefixChecker:Function;
    private validator:Function;

    constructor(ruleName:string, value:any, disabledIntervals:Lint.IDisabledInterval[]) {
        super(ruleName, value, disabledIntervals);
        if (value[1] === 'kebab-case') {
            this.validator = SelectorValidator.kebabCase;
        }
        if (value[2]) {
            this.hasPrefix = true;
            this.prefix = value[2];
            this.prefixChecker = SelectorValidator.prefix(value[2]);
        }
    }

    public apply(sourceFile:ts.SourceFile):Lint.RuleFailure[] {
        return this.applyWithWalker(
            new ClassMetadataWalker(sourceFile, this));
    }

    public validateName(name:string):boolean {
        return this.validator(name);
    }

    public validatePrefix(prefix:string):boolean {
        return this.prefixChecker(prefix);
    }

    static  FAILURE_WITHOUT_PREFIX:string = 'The name of the Pipe decorator of class %s should' +
        ' be named kebab-case, however its value is "%s".';

    static  FAILURE_WITH_PREFIX:string = 'The name of the Pipe decorator of class %s should' +
        ' be named kebab-case with prefix %s, however its value is "%s".';
}

export class ClassMetadataWalker extends Lint.RuleWalker {

    constructor(sourceFile:ts.SourceFile, private rule:Rule) {
        super(sourceFile, rule.getOptions());
    }

    visitClassDeclaration(node:ts.ClassDeclaration) {
        let className = node.name.text;
        let decorators = node.decorators || [];
        decorators.filter(d=> {
            let baseExpr = <any>d.expression || {};
            return baseExpr.expression.text === 'Pipe'
        }).forEach(this.validateProperties.bind(this, className));
        super.visitClassDeclaration(node);
    }

    private validateProperties(className:string, pipe:any) {
        let argument = this.extractArgument(pipe);
        if (argument.kind === SyntaxKind.current().ObjectLiteralExpression) {
            argument.properties.filter(n=>n.name.text === 'name')
                .forEach(this.validateProperty.bind(this, className))
        }
    }

    private extractArgument(pipe:any) {
        let baseExpr = <any>pipe.expression || {};
        let args = baseExpr.arguments || [];
        return args[0];
    }

    private validateProperty(className:string, property:any) {
        let propName:string = property.initializer.text;
        let isValidName:boolean = this.rule.validateName(propName);
        let isValidPrefix:boolean = (this.rule.hasPrefix?this.rule.validatePrefix(propName):true);
        if (!isValidName || !isValidPrefix) {
            this.addFailure(
                this.createFailure(
                    property.getStart(),
                    property.getWidth(),
                    sprintf.apply(this, this.createFailureArray(className, propName))));
        }
    }

    private createFailureArray(className:string, pipeName:string):Array<string> {
        if (this.rule.hasPrefix) {
            return [Rule.FAILURE_WITH_PREFIX, className, this.rule.prefix, pipeName];
        }
        return [Rule.FAILURE_WITHOUT_PREFIX, className, pipeName];
    }

}
