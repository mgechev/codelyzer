export declare enum CssTokenType {
    EOF = 0,
    String = 1,
    Comment = 2,
    Identifier = 3,
    Number = 4,
    IdentifierOrNumber = 5,
    AtKeyword = 6,
    Character = 7,
    Whitespace = 8,
    Invalid = 9,
}
export declare enum CssLexerMode {
    ALL = 0,
    ALL_TRACK_WS = 1,
    SELECTOR = 2,
    PSEUDO_SELECTOR = 3,
    PSEUDO_SELECTOR_WITH_ARGUMENTS = 4,
    ATTRIBUTE_SELECTOR = 5,
    AT_RULE_QUERY = 6,
    MEDIA_QUERY = 7,
    BLOCK = 8,
    KEYFRAME_BLOCK = 9,
    STYLE_BLOCK = 10,
    STYLE_VALUE = 11,
    STYLE_VALUE_FUNCTION = 12,
    STYLE_CALC_FUNCTION = 13,
}
export declare class LexedCssResult {
    error: CssScannerError;
    token: CssToken;
    constructor(error: CssScannerError, token: CssToken);
}
export declare function generateErrorMessage(input: string, message: string, errorValue: string, index: number, row: number, column: number): string;
export declare function findProblemCode(input: string, errorValue: string, index: number, column: number): string;
export declare class CssToken {
    index: number;
    column: number;
    line: number;
    type: CssTokenType;
    strValue: string;
    numValue: number;
    constructor(index: number, column: number, line: number, type: CssTokenType, strValue: string);
}
export declare class CssLexer {
    scan(text: string, trackComments?: boolean): CssScanner;
}
export declare class CssScannerError {
    token: CssToken;
    rawMessage: string;
    message: string;
    constructor(token: CssToken, message: string);
    toString(): string;
}
export declare class CssScanner {
    input: string;
    private _trackComments;
    peek: number;
    peekPeek: number;
    length: number;
    index: number;
    column: number;
    line: number;
    _currentMode: CssLexerMode;
    _currentError: CssScannerError;
    constructor(input: string, _trackComments?: boolean);
    getMode(): CssLexerMode;
    setMode(mode: CssLexerMode): void;
    advance(): void;
    peekAt(index: number): number;
    consumeEmptyStatements(): void;
    consumeWhitespace(): void;
    consume(type: CssTokenType, value?: string): LexedCssResult;
    scan(): LexedCssResult;
    _scan(): CssToken;
    scanComment(): CssToken;
    scanWhitespace(): CssToken;
    scanString(): CssToken;
    scanNumber(): CssToken;
    scanIdentifier(): CssToken;
    scanCssValueFunction(): CssToken;
    scanCharacter(): CssToken;
    scanAtExpression(): CssToken;
    assertCondition(status: boolean, errorMessage: string): boolean;
    error(message: string, errorTokenValue?: string, doNotAdvance?: boolean): CssToken;
}
export declare function isNewline(code: number): boolean;
