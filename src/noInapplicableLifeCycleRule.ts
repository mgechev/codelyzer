import * as Lint from 'tslint';
import * as ts from 'typescript';
import * as SyntaxKind from './util/syntaxKind';
import {sprintf} from 'sprintf-js';
import {Ng2Walker} from './angular/ng2Walker';
import {difference, intersection} from './util/setOperations';
import {InheritanceForest} from './util/inheritanceForest';


function getHeritageNames(t: any): string {
  if (t.expression && t.expression.name) {
    return t.expression.name.text;
  }
  return t.expression.text;
}

// TODO
// I get
// error TS2365: Operator '==' cannot be applied to types 'SyntaxKind' and 'SyntaxKind'.
// if I specify syntax type as SyntaxKind.SyntaxKind
function getHeritage(node: ts.ClassDeclaration, syntax: any): any[] {
  if (node.heritageClauses) {
    const clause = node.heritageClauses
      .filter((clause: ts.HeritageClause) => clause.token == syntax);
    if (clause.length) {
      return clause[0].types;
    }
  }
  return [];
}

function getDecoratorNames(node: ts.ClassDeclaration): string[] {
  if (node.decorators) {
    return node.decorators.map((d: any) => {
      if (d.expression.expression) {
        // If decorator is invoked; @Injectable()
        return d.expression.expression.text;
      } else {
        // If decorator is not invoked; @Injectable
        return d.expression.text;
      }
    });
  }
  return [];
}

export class Rule extends Lint.Rules.AbstractRule {

  static FAILURE_NOT_CMP_OR_DIR_FACTORY = (hookNames: {name: string, path: string[] | null}[]) => {
    const commonMessage = `The %s class is not a Component or Directive yet implements`;
    const hooksWithPaths = hookNames
      .map(hook => {
        let str = hook.name;
        if (hook.path) {
          str += ` (from ${hook.path.slice(1, -1).join(' -> ')})`;
        }
        return str;
      });
    if (hooksWithPaths.length == 1) {
      return `${commonMessage} a life cycle hook ${hooksWithPaths[0]}.`;
    } else {
      return `${commonMessage} these life cycle hooks: ${hooksWithPaths.join(', ')}.`;
    }
  };

  static CMP_OR_DIR: Set<string> = new Set([
    'OnChanges',
    'OnInit',
    'DoCheck',
    'AfterContentInit',
    'AfterContentChecked',
    'AfterViewInit',
    'AfterViewChecked',
    'OnDestroy',
  ]);

  static SERVICE: Set<string> = new Set([
    'OnDestroy',
  ]);

  static CMP_OR_DIR_ONLY: Set<string> = difference(Rule.CMP_OR_DIR, Rule.SERVICE);

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new LifeCycleDecoratorWalker(sourceFile, this.getOptions()));
  }

}

export class LifeCycleDecoratorWalker extends Ng2Walker {

  public inheritanceForest = new InheritanceForest();

  public possibleFailures = new Map<string, Lint.RuleFailure>();

  private addPossibleFailure(node: ts.ClassDeclaration, disallowedHookNames: string[]): void {
    const hooks = disallowedHookNames
      .map(hook => ({
        name: hook,
        path: this.inheritanceForest.getPath(node.name.text, hook),
      }))
      .map(hook => {
        if (hook.path.length == 2) {
          hook.path = null;
        }
        return hook;
      });
    const failure = this.createFailure(
      node.name.getStart(),
      node.name.getWidth(),
      sprintf.apply(this, [Rule.FAILURE_NOT_CMP_OR_DIR_FACTORY(hooks), node.name.text]));
    this.possibleFailures.set(node.name.text, failure);
  }

  public visitClassDeclaration(node: ts.ClassDeclaration) {
    const className: string = node.name.text;

    const interfaces = getHeritage(node, SyntaxKind.current().ImplementsKeyword);
    const interfaceNames = interfaces.map(getHeritageNames);
    const baseClassNames = getHeritage(node, SyntaxKind.current().ExtendsKeyword).map(getHeritageNames);

    this.inheritanceForest.add(className, [...baseClassNames, ...interfaceNames]);
    const heritageNames = this.inheritanceForest.getHeritage(className);
    // console.log(className, '-->', heritageNames);

    const decoratorNames = getDecoratorNames(node);

    // Add a new possible failure
    if (decoratorNames.every(name => name != 'Component' && name != 'Directive')) {
      // not a component, not a directive

      // if true:  not a service (we disallow OnDestroy as well)
      // if false: a service (we allow OnDestroy but still look for others)
      const checkAgainst = decoratorNames.every(name => name != 'Injectable') ?
        Rule.CMP_OR_DIR :
        Rule.CMP_OR_DIR_ONLY;

      const disallowedHooks = Array.from(intersection(new Set(heritageNames), checkAgainst));
      if (disallowedHooks.length > 0) {
        // it implements a life cycle which can be only applied to component or directive
        this.addPossibleFailure(node, disallowedHooks);
      }
    }

    // Remove an earlier added possible failure
    heritageNames.forEach(base => {
      if (this.possibleFailures.has(base)) {
        // We marked this as a possible failure
        // Now we know it's not because it's extended (so the error is "propagated"  down the
        // inheritance tree until the leaves where it's either resolved or stays there
        this.possibleFailures.delete(base);
      }
    });
    this['failures'] = []; // Clear failures?
    this.possibleFailures.forEach(this.addFailure.bind(this));

    super.visitClassDeclaration(node);
  }

}
