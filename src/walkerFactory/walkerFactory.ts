import * as ts from 'typescript';
import {Ng2Walker} from '../angular/ng2Walker';
import {IOptions} from 'tslint';
import {ComponentMetadata} from '../angular/metadata';
import {F1, Maybe} from '../util/function';

type Walkable = 'Ng2Component';

export function allNg2Component(): WalkerBuilder<'Ng2Component'> {
    return new Ng2ComponentWalkerBuilder();
}

export class Failure {
    constructor(public node: ts.Node, public message: string) {}
}

interface WalkerBuilder<T extends Walkable> {
    where: (validate: F1<ComponentMetadata, Maybe<Failure>>) => WalkerBuilder<T>;
    build: (sourceFile: ts.SourceFile, options: IOptions) => Ng2Walker;
}

class Ng2ComponentWalkerBuilder implements WalkerBuilder<'Ng2Component'> {
    private _where: F1<ComponentMetadata, Maybe<Failure>>;

    where(validate: F1<ComponentMetadata, Maybe<Failure>>):Ng2ComponentWalkerBuilder {
        this._where = validate;
        return this;
    }

    build(sourceFile: ts.SourceFile, options: IOptions): Ng2Walker {
        const self = this;
        const e = class extends Ng2Walker {
            visitNg2Component(meta: ComponentMetadata) {
                self._where(meta).fmap(failure => {
                    this.addFailure(
                        this.createFailure(
                            failure.node.getStart(),
                            failure.node.getWidth(),
                            failure.message,
                        ));
                });
                super.visitNg2Component(meta);
            }
        };
        return new e(sourceFile, options);
    }
}
