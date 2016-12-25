import * as ts from 'typescript';
import {FileResolver} from './fileResolver/fileResolver';
import {AbstractResolver, MetadataUrls} from './urlResolvers/abstractResolver';
import {UrlResolver} from './urlResolvers/urlResolver';
import {PathResolver} from './urlResolvers/pathResolver';

import {logger} from '../util/logger';

import {Config} from './config';

import {DirectiveMetadata, ComponentMetadata, CodeWithSourceMap, TemplateMetadata} from './metadata';
import {Maybe, unwrapFirst, ifTrue,} from '../util/function';
import {
    callExpression, withIdentifier, hasProperties,
    isSimpleTemplateString, getStringInitializerFromProperty, decoratorArgument
} from '../util/astQuery';
import {getTemplate, getInlineStyle} from '../util/ngQuery';

const normalizeTransformed = (t: CodeWithSourceMap) => {
    if (!t.map) {
        t.source = t.code;
    }
    return t;
};


/**
 * For async implementation https://gist.github.com/mgechev/6f2245c0dfb38539cc606ea9211ecb37
 */
export class MetadataReader {

    constructor(private _fileResolver: FileResolver, private _urlResolver?: AbstractResolver) {
        this._urlResolver = this._urlResolver || new UrlResolver(new PathResolver());
    }

    read(d: ts.ClassDeclaration): DirectiveMetadata {
        let componentMetadata = unwrapFirst(
            (d.decorators || ([] as ts.Decorator[])).map((dec: ts.Decorator) => {
                return Maybe.lift(dec).bind(callExpression)
                    .bind(withIdentifier('Component'))
                    .fmap(() => this.readComponentMetadata(d, dec));
            }));

        let directiveMetadata = unwrapFirst(
            (d.decorators || ([] as ts.Decorator[])).map((dec: ts.Decorator) =>
                Maybe.lift(dec)
                    .bind(callExpression)
                    .bind(withIdentifier('Directive'))
                    .fmap(() => this.readDirectiveMetadata(d, dec))
            ));

        return directiveMetadata || componentMetadata || undefined;
    }

    readDirectiveMetadata(d: ts.ClassDeclaration, dec: ts.Decorator): DirectiveMetadata {

        const selector = this.getDecoratorArgument(dec)
            .bind(expr => getStringInitializerFromProperty('selector', expr.properties))
            .fmap(initializer => initializer.text);

        return Object.assign(new DirectiveMetadata(), {
            controller: d,
            decorator: dec,
            selector: selector.unwrap(),
        });
    }

    readComponentTemplateMetadata(dec: ts.Decorator, external: MetadataUrls): TemplateMetadata {
        const template_M = getTemplate(dec)
            .fmap(inlineTemplate => {
                const transformed = normalizeTransformed(Config.transformTemplate(inlineTemplate.text, null, dec));
                return {
                    template: transformed,
                    url: null,
                    node: inlineTemplate,
                };
            });

        if (template_M.isSomething) {
            return template_M.unwrap();
        } else {
            // TODO: Refactoring this requires adding seem to fileResolver
            if (external.templateUrl) {
                try {
                    const template = this._fileResolver.resolve(external.templateUrl);
                    const transformed = normalizeTransformed(Config.transformTemplate(template, external.templateUrl, dec));
                    return {
                        template: transformed,
                        url: external.templateUrl,
                        node: null
                    };
                } catch (e) {
                    logger.info('Cannot read the external template ' + external.templateUrl);
                }
            }
        }
    }

    readComponentStylesMetadata(dec: ts.Decorator, external: MetadataUrls) {
        let styles: any[];
        const inlineStyles_M = getInlineStyle(dec)
            .fmap(inlineStyles => {
                return inlineStyles.elements.map((inlineStyle: ts.Expression) => {
                    if (isSimpleTemplateString(inlineStyle)) {
                        return {
                            style: normalizeTransformed(Config.transformStyle(inlineStyle.text, null, dec)),
                            url: null,
                            node: inlineStyle,
                        };
                    }
                }).filter(v => !!v);
            });

        if (inlineStyles_M.isSomething) {
            return inlineStyles_M.unwrap();
        } else if (external.styleUrls) {
            // TODO: Refactoring this requires adding seem to fileResolver
            try {
                styles = <any>external.styleUrls.map((url: string) => {
                    const style = this._fileResolver.resolve(url);
                    const transformed = normalizeTransformed(Config.transformStyle(style, url, dec));
                    return {
                        style: transformed, url,
                        node: null
                    };
                });
            } catch (e) {
                logger.info('Unable to read external style. ' + e.toString());
            }
        }
        return styles;
    }

    readComponentMetadata(d: ts.ClassDeclaration, dec: ts.Decorator) {
        const expr = this.getDecoratorArgument(dec);
        const directiveMetadata = this.readDirectiveMetadata(d, dec);

        const external_M = expr.fmap(() => this._urlResolver.resolve(dec));

        const template_M = external_M.fmap(
            (external) => this.readComponentTemplateMetadata(dec, external));
        const style_M = external_M.fmap(
            (external) => this.readComponentStylesMetadata(dec, external));

        return Object.assign(new ComponentMetadata(), directiveMetadata, {
            template: template_M.unwrap(),
            styles: style_M.unwrap(),
        });
    }

    protected getDecoratorArgument(decorator: ts.Decorator): Maybe<ts.ObjectLiteralExpression> {
        return decoratorArgument(decorator)
            .bind(ifTrue(hasProperties));
    }
}
