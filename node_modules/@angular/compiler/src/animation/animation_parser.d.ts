import { CompileAnimationEntryMetadata, CompileDirectiveMetadata } from '../compile_metadata';
import { ParseError } from '../parse_util';
import { ElementSchemaRegistry } from '../schema/element_schema_registry';
import { AnimationEntryAst } from './animation_ast';
export declare class AnimationParseError extends ParseError {
    constructor(message: string);
    toString(): string;
}
export declare class AnimationEntryParseResult {
    ast: AnimationEntryAst;
    errors: AnimationParseError[];
    constructor(ast: AnimationEntryAst, errors: AnimationParseError[]);
}
export declare class AnimationParser {
    private _schema;
    constructor(_schema: ElementSchemaRegistry);
    parseComponent(component: CompileDirectiveMetadata): AnimationEntryAst[];
    parseEntry(entry: CompileAnimationEntryMetadata): AnimationEntryParseResult;
}
