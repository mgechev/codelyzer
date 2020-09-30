import { NgWalkerConfig } from './ngWalker';
import { MetadataReader } from './metadataReader';
import { UrlResolver } from './urlResolvers/urlResolver';
import { FsFileResolver } from './fileResolver/fsFileResolver';
import { BasicCssAstVisitor } from './styles/basicCssAstVisitor';

import { RecursiveAngularExpressionVisitor } from './templates/recursiveAngularExpressionVisitor';
import { BasicTemplateAstVisitor } from './templates/basicTemplateAstVisitor';

import { PathResolver } from './urlResolvers/pathResolver';

export const ngWalkerFactoryUtils = {
  defaultConfig() {
    return {
      templateVisitorCtrl: BasicTemplateAstVisitor,
      expressionVisitorCtrl: RecursiveAngularExpressionVisitor,
      cssVisitorCtrl: BasicCssAstVisitor,
    };
  },

  defaultMetadataReader() {
    return new MetadataReader(new FsFileResolver(), new UrlResolver(new PathResolver()));
  },

  normalizeConfig(config: NgWalkerConfig) {
    return Object.assign(this.defaultConfig(), config || {});
  },
};
