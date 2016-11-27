import * as ts from 'typescript';
import * as Lint from 'tslint';
import {Ng2Walker, Ng2WalkerConfig} from './ng2Walker';
import {MetadataReader} from './metadataReader';
import {UrlResolver} from './urlResolvers/urlResolver';
import {FsFileResolver} from './fileResolver/fsFileResolver';
import {BasicCssAstVisitor, CssAstVisitorCtrl} from './styles/basicCssAstVisitor';
import {Config} from './config';

import { RecursiveAngularExpressionVisitor } from './templates/recursiveAngularExpressionVisitor';
import {BasicTemplateAstVisitor} from './templates/basicTemplateAstVisitor';

import {PathResolver} from './urlResolvers/pathResolver';

export const ng2WalkerFactoryUtils = {
  defaultConfig() {
    return {
      templateVisitorCtrl: BasicTemplateAstVisitor,
      expressionVisitorCtrl: RecursiveAngularExpressionVisitor,
      cssVisitorCtrl: BasicCssAstVisitor
    };
  },

  defaultMetadataReader() {
    return new MetadataReader(new FsFileResolver(), new UrlResolver(new PathResolver()));
  },

  normalizeConfig(config: Ng2WalkerConfig) {
    return Object.assign(this.defaultConfig(), config || {});
  }
};
