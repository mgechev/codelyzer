import * as ts from 'typescript';
import {Ng2Walker} from '../angular/ng2Walker';
import {IOptions} from 'tslint';
import {ComponentMetadata} from '../angular/metadata';
import {F1, F2, Maybe} from '../util/function';
import {Failure} from './walkerFactory';

type ComponentWalkable = 'Ng2Component';

type Validator = NodeValidator | ComponentValidator;
type ValidateFn<T> = F1<T, Maybe<Failure[]>>;

interface NodeValidator {
    kind: 'Node';
    validate: ValidateFn<ts.Node>;
}

interface ComponentValidator {
    kind: ComponentWalkable;
    validate: ValidateFn<ComponentMetadata>;
}

export function validate(syntaxKind: ts.SyntaxKind): F1<ValidateFn<ts.Node>, NodeValidator> {
    return validateFn => ({
        kind: 'Node',
        validate: (node: ts.Node) => (node.kind === syntaxKind) ? validateFn(node) : Maybe.nothing,
    });
}

export function validateComponent(validate: F1<ComponentMetadata, Maybe<Failure[]>>): ComponentValidator {
    return {
        kind: 'Ng2Component',
        validate,
    };
}

export function all(...validators: Validator[]): F2<ts.SourceFile, IOptions, Ng2Walker> {
    return (sourceFile, options) => {
        const e = class extends Ng2Walker {
            visitNg2Component(meta: ComponentMetadata) {
                validators.forEach(v => {
                    if (v.kind === 'Ng2Component') {
                        v.validate(meta).fmap(
                            failures => failures.forEach(f => this.failed(f)));
                    }
                });
                super.visitNg2Component(meta);
            }

            visitNode(node: ts.Node) {
                validators.forEach(v => {
                    if (v.kind === 'Node') {
                        v.validate(node).fmap(
                            failures => failures.forEach(f => this.failed(f)));
                    }
                });
                super.visitNode(node);
            }

            private failed(failure: Failure) {
                this.addFailure(
                    this.createFailure(
                        failure.node.getStart(),
                        failure.node.getWidth(),
                        failure.message,
                    ));
            }
        };
        return new e(sourceFile, options);
    };
}
