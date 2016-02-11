import * as Lint from 'tslint/lib/lint';
import * as ts from 'typescript';
import {DirectiveMetadataWalker} from './useParameterDecoratorsBase';

export class Rule extends Lint.Rules.AbstractRule {
  private static FAILURE_STRING = `In the "@%s" class decorator of the class "%s" you are using the "%s" property, this is considered bad practice. Use "@%s" property decorator instead.`;

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    let documentRegistry = ts.createDocumentRegistry();
    let languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
    let languageService : ts.LanguageService = ts.createLanguageService(languageServiceHost, documentRegistry);
    return this.applyWithWalker(new DirectiveMetadataWalker(sourceFile, this.getOptions(), languageService, {
      decoratorName: 'Input',
      propertyName: 'inputs',
      errorMessage: Rule.FAILURE_STRING
    }));
  }
}
