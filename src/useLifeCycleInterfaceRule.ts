import * as Lint from 'tslint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';

const getInterfaceName = (t: any) => {
  if (t.expression && t.expression.name) {
    return t.expression.name.text;
  }
  return t.expression.text;
};

export class Rule extends Lint.Rules.TypedRule {

  static FAILURE:string = 'Implement lifecycle hook interface %s for method %s in class %s ($$09-01$$)';

  static HOOKS_PREFIX = 'ng';

  static LIFE_CYCLE_HOOKS_NAMES:Array<any> = [
    'OnChanges',
    'OnInit',
    'DoCheck',
    'AfterContentInit',
    'AfterContentChecked',
    'AfterViewInit',
    'AfterViewChecked',
    'OnDestroy'
  ];

  public applyWithProgram(sourceFile: ts.SourceFile, languageService: ts.LanguageService): Lint.RuleFailure[] {
    const sf = languageService.getProgram().getSourceFiles().filter(sf => sf.fileName === sourceFile.fileName).pop();
    return this.applyWithWalker(
      new ClassMetadataWalker(sf,
        this.getOptions(),
        languageService));
  }
}

export class ClassMetadataWalker extends Lint.RuleWalker {

  constructor(sourceFile: ts.SourceFile, options: Lint.IOptions, protected languageService: ts.LanguageService) {
    super(sourceFile, options);
  }

  visitClassDeclaration(node: ts.ClassDeclaration) {
    const typeChecker = this.languageService.getProgram().getTypeChecker();
    let interfaces: string[] = [];
    let baseType = node;
    while (baseType) {
      interfaces = interfaces.concat(this.extractInterfaces(baseType));
      const baseTypes = typeChecker.getTypeAtLocation(baseType).getBaseTypes();
      if (baseTypes[0] && baseTypes[0].getSymbol()) {
        baseType = baseTypes[0].getSymbol().declarations[0] as ts.ClassDeclaration;
      } else {
        baseType = null;
      }
    }
    let className = node.name.text;
    let methods = node.members.filter(m => m.kind === ts.SyntaxKind.MethodDeclaration);
    this.validateMethods(methods, interfaces, className);
    super.visitClassDeclaration(node);
  }

  private extractInterfaces(node: ts.ClassDeclaration): string[] {
    let interfaces:string[] = [];
    if (node.heritageClauses) {
      let interfacesClause = node.heritageClauses.filter(h => h.token === ts.SyntaxKind.ImplementsKeyword);
      if (interfacesClause.length !== 0) {
        interfaces = interfacesClause[0].types.map(getInterfaceName);
      }
    }
    return interfaces;
  }

  private validateMethods(methods:any[],interfaces:string[],className:string){
    methods.forEach(m => {
      let n = (<any>m.name).text;
      if (n && this.isMethodValidHook(m,interfaces)){
        let hookName = n.substr(2, n.lenght);
        this.addFailure(
          this.createFailure(
            m.name.getStart(),
            m.name.getWidth(),
        sprintf.apply(this, [Rule.FAILURE, hookName,Rule.HOOKS_PREFIX + hookName, className])));
      }
    });
  }

  private isMethodValidHook(m:any,interfaces:string[]):boolean{
    let n = (<any>m.name).text;
    let isNg:boolean = n.substr(0, 2) === Rule.HOOKS_PREFIX;
    let hookName = n.substr(2, n.lenght);
    let isHook = Rule.LIFE_CYCLE_HOOKS_NAMES.indexOf(hookName) !== -1;
    let isNotIn:boolean = interfaces.indexOf(hookName) === -1;
    return isNg && isHook && isNotIn;
  }

}
