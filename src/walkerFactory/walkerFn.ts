import * as ts from "typescript";
import {Ng2Walker} from '../angular/ng2Walker';
import {IOptions} from 'tslint';
import {ComponentMetadata} from '../angular/metadata';
import {F1, F2, Maybe} from '../util/function';
import {Failure} from './walkerFactory';

type ComponentWalkable = 'Ng2Component';

type Validator = NodeValidator | ComponentValidator;

interface NodeValidator {
    kind: 'Node';
    validate: F1<ts.Node, Maybe<Failure>>;
}

interface ComponentValidator {
    kind: ComponentWalkable;
    validate: F1<ComponentMetadata, Maybe<Failure>>;
}


export function validateComponent(validate: F1<ComponentMetadata, Maybe<Failure>>): ComponentValidator {
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
                        v.validate(meta).fmap(failure => {
                            this.addFailure(
                                this.createFailure(
                                    failure.node.getStart(),
                                    failure.node.getWidth(),
                                    failure.message,
                                ));
                        });
                    }
                });
                super.visitNg2Component(meta);
            }

        }
        return new e(sourceFile, options);
    }
}
