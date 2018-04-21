import * as ts from 'typescript';

/**
 * This module provides backwards compatibility for TypeScript's ts.SyntaxKind interface.
 * The numbers assigned to the enum elements change with each TypeScript release, so if
 * we want to run these rules against multiple versions of TypeScript then we need to query
 * the TypeScript version at runtime and return the correct numbers for the SyntaxKind
 * elements.
 */
namespace SyntaxKind {
  export interface SyntaxKind {
    Unknown: number;
    EndOfFileToken: number;
    SingleLineCommentTrivia: number;
    MultiLineCommentTrivia: number;
    NewLineTrivia: number;
    WhitespaceTrivia: number;
    ShebangTrivia?: number; //1.6 only
    ConflictMarkerTrivia: number;
    NumericLiteral: number;
    StringLiteral: number;
    RegularExpressionLiteral: number;
    NoSubstitutionTemplateLiteral: number;
    TemplateHead: number;
    TemplateMiddle: number;
    TemplateTail: number;
    OpenBraceToken: number;
    CloseBraceToken: number;
    OpenParenToken: number;
    CloseParenToken: number;
    OpenBracketToken: number;
    CloseBracketToken: number;
    DotToken: number;
    DotDotDotToken: number;
    SemicolonToken: number;
    CommaToken: number;
    LessThanToken: number;
    LessThanSlashToken?: number; //1.6 only
    GreaterThanToken: number;
    LessThanEqualsToken: number;
    GreaterThanEqualsToken: number;
    EqualsEqualsToken: number;
    ExclamationEqualsToken: number;
    EqualsEqualsEqualsToken: number;
    ExclamationEqualsEqualsToken: number;
    EqualsGreaterThanToken: number;
    PlusToken: number;
    MinusToken: number;
    AsteriskToken: number;
    SlashToken: number;
    PercentToken: number;
    PlusPlusToken: number;
    MinusMinusToken: number;
    LessThanLessThanToken: number;
    GreaterThanGreaterThanToken: number;
    GreaterThanGreaterThanGreaterThanToken: number;
    AmpersandToken: number;
    BarToken: number;
    CaretToken: number;
    ExclamationToken: number;
    TildeToken: number;
    AmpersandAmpersandToken: number;
    BarBarToken: number;
    QuestionToken: number;
    ColonToken: number;
    AtToken: number;
    EqualsToken: number;
    PlusEqualsToken: number;
    MinusEqualsToken: number;
    AsteriskEqualsToken: number;
    SlashEqualsToken: number;
    PercentEqualsToken: number;
    LessThanLessThanEqualsToken: number;
    GreaterThanGreaterThanEqualsToken: number;
    GreaterThanGreaterThanGreaterThanEqualsToken: number;
    AmpersandEqualsToken: number;
    BarEqualsToken: number;
    CaretEqualsToken: number;
    Identifier: number;
    BreakKeyword: number;
    CaseKeyword: number;
    CatchKeyword: number;
    ClassKeyword: number;
    ConstKeyword: number;
    ContinueKeyword: number;
    DebuggerKeyword: number;
    DefaultKeyword: number;
    DeleteKeyword: number;
    DoKeyword: number;
    ElseKeyword: number;
    EnumKeyword: number;
    ExportKeyword: number;
    ExtendsKeyword: number;
    FalseKeyword: number;
    FinallyKeyword: number;
    ForKeyword: number;
    FunctionKeyword: number;
    IfKeyword: number;
    ImportKeyword: number;
    InKeyword: number;
    InstanceOfKeyword: number;
    NewKeyword: number;
    NullKeyword: number;
    ReturnKeyword: number;
    SuperKeyword: number;
    SwitchKeyword: number;
    ThisKeyword: number;
    ThrowKeyword: number;
    TrueKeyword: number;
    TryKeyword: number;
    TypeOfKeyword: number;
    VarKeyword: number;
    VoidKeyword: number;
    WhileKeyword: number;
    WithKeyword: number;
    ImplementsKeyword: number;
    InterfaceKeyword: number;
    LetKeyword: number;
    PackageKeyword: number;
    PrivateKeyword: number;
    ProtectedKeyword: number;
    PublicKeyword: number;
    StaticKeyword: number;
    YieldKeyword: number;
    AbstractKeyword?: number; //1.6 only
    AsKeyword: number;
    AnyKeyword: number;
    AsyncKeyword?: number; //1.6 only
    AwaitKeyword?: number; //1.6 only
    BooleanKeyword: number;
    ConstructorKeyword: number;
    DeclareKeyword: number;
    GetKeyword: number;
    IsKeyword?: number; //1.6 only
    KeyOfKeyword?: number; //2.1 only
    ModuleKeyword: number;
    NamespaceKeyword: number;
    RequireKeyword: number;
    NumberKeyword: number;
    SetKeyword: number;
    StringKeyword: number;
    SymbolKeyword: number;
    TypeKeyword: number;
    FromKeyword: number;
    OfKeyword: number;
    QualifiedName: number;
    ComputedPropertyName: number;
    TypeParameter: number;
    Parameter: number;
    Decorator: number;
    PropertySignature: number;
    PropertyDeclaration: number;
    MethodSignature: number;
    MethodDeclaration: number;
    Constructor: number;
    GetAccessor: number;
    SetAccessor: number;
    CallSignature: number;
    ConstructSignature: number;
    IndexSignature: number;
    TypePredicate?: number; //1.6 only
    TypeReference: number;
    FunctionType: number;
    ConstructorType: number;
    TypeQuery: number;
    TypeLiteral: number;
    ArrayType: number;
    TupleType: number;
    UnionType: number;
    IntersectionType?: number; //1.6 only
    ParenthesizedType: number;
    ObjectBindingPattern: number;
    ArrayBindingPattern: number;
    BindingElement: number;
    ArrayLiteralExpression: number;
    ObjectLiteralExpression: number;
    PropertyAccessExpression: number;
    ElementAccessExpression: number;
    CallExpression: number;
    NewExpression: number;
    TaggedTemplateExpression: number;
    TypeAssertionExpression: number;
    ParenthesizedExpression: number;
    FunctionExpression: number;
    ArrowFunction: number;
    DeleteExpression: number;
    TypeOfExpression: number;
    VoidExpression: number;
    AwaitExpression?: number; //1.6 only
    PrefixUnaryExpression: number;
    PostfixUnaryExpression: number;
    BinaryExpression: number;
    ConditionalExpression: number;
    TemplateExpression: number;
    YieldExpression: number;
    SpreadElementExpression?: number;
    ClassExpression: number;
    OmittedExpression: number;
    ExpressionWithTypeArguments: number;
    AsExpression?: number; //1.6 only
    TemplateSpan: number;
    SemicolonClassElement: number;
    Block: number;
    VariableStatement: number;
    EmptyStatement: number;
    ExpressionStatement: number;
    IfStatement: number;
    DoStatement: number;
    WhileStatement: number;
    ForStatement: number;
    ForInStatement: number;
    ForOfStatement: number;
    ContinueStatement: number;
    BreakStatement: number;
    ReturnStatement: number;
    WithStatement: number;
    SwitchStatement: number;
    LabeledStatement: number;
    ThrowStatement: number;
    TryStatement: number;
    DebuggerStatement: number;
    VariableDeclaration: number;
    VariableDeclarationList: number;
    FunctionDeclaration: number;
    ClassDeclaration: number;
    InterfaceDeclaration: number;
    TypeAliasDeclaration: number;
    EnumDeclaration: number;
    ModuleDeclaration: number;
    ModuleBlock: number;
    CaseBlock: number;
    ImportEqualsDeclaration: number;
    ImportDeclaration: number;
    ImportClause: number;
    NamespaceImport: number;
    NamedImports: number;
    ImportSpecifier: number;
    ExportAssignment: number;
    ExportDeclaration: number;
    NamedExports: number;
    ExportSpecifier: number;
    MissingDeclaration: number;
    ExternalModuleReference: number;
    JsxElement?: number; //1.6 only
    JsxSelfClosingElement?: number; //1.6 only
    JsxOpeningElement?: number; //1.6 only
    JsxText?: number; //1.6 only
    JsxClosingElement?: number; //1.6 only
    JsxAttribute?: number; //1.6 only
    JsxSpreadAttribute?: number; //1.6 only
    JsxExpression?: number; //1.6 only
    CaseClause: number;
    DefaultClause: number;
    HeritageClause: number;
    CatchClause: number;
    PropertyAssignment: number;
    ShorthandPropertyAssignment: number;
    EnumMember: number;
    SourceFile: number;
    JSDocTypeExpression?: number; //1.6 only
    JSDocAllType?: number; //1.6 only
    JSDocUnknownType?: number; //1.6 only
    JSDocArrayType?: number; //1.6 only
    JSDocUnionType?: number; //1.6 only
    JSDocTupleType?: number; //1.6 only
    JSDocNullableType?: number; //1.6 only
    JSDocNonNullableType?: number; //1.6 only
    JSDocRecordType?: number; //1.6 only
    JSDocRecordMember?: number; //1.6 only
    JSDocTypeReference?: number; //1.6 only
    JSDocOptionalType?: number; //1.6 only
    JSDocFunctionType?: number; //1.6 only
    JSDocVariadicType?: number; //1.6 only
    JSDocConstructorType?: number; //1.6 only
    JSDocThisType?: number; //1.6 only
    JSDocComment?: number; //1.6 only
    JSDocTag?: number; //1.6 only
    JSDocParameterTag?: number; //1.6 only
    JSDocReturnTag?: number; //1.6 only
    JSDocTypeTag?: number; //1.6 only
    JSDocTemplateTag?: number; //1.6 only
    SyntaxList: number;
    Count: number;
    FirstAssignment: number;
    LastAssignment: number;
    FirstReservedWord: number;
    LastReservedWord: number;
    FirstKeyword: number;
    LastKeyword: number;
    FirstFutureReservedWord: number;
    LastFutureReservedWord: number;
    FirstTypeNode: number;
    LastTypeNode: number;
    FirstPunctuation: number;
    LastPunctuation: number;
    FirstToken: number;
    LastToken: number;
    FirstTriviaToken: number;
    LastTriviaToken: number;
    FirstLiteralToken: number;
    LastLiteralToken: number;
    FirstTemplateToken: number;
    LastTemplateToken: number;
    FirstBinaryOperator: number;
    LastBinaryOperator: number;
    FirstNode: number;
    AsteriskAsteriskToken?: number; // 1.7 only
    AsteriskAsteriskEqualsToken?: number; // 1.7 only
    GlobalKeyword?: number; // 1.8 only
    ThisType?: number; // 1.8 only
    TypeOperator?: number; // 2.1 only
    IndexedAccessType?: number; // 2.1 only
    MappedType?: number; // 2.1 only
    SpreadElement?: number; // 2.1 only
    SpreadAssignment?: number; // 2.1 only
    StringLiteralType?: number; // 1.8 only
    GlobalModuleExportDeclaration?: number;
    NonNullExpression?: number;
    UndefinedKeyword?: number;
    ReadonlyKeyword?: number;
    NeverKeyword?: number; // 2.0,
    NamespaceExportDeclaration?: number; // 2.0
    JSDocTypedefTag?: number; // 2.0
    JSDocPropertyTag?: number; // 2.0
    JSDocTypeLiteral?: number; // 2.0
    JSDocAugmentsTag?: number; // 2.1
    FirstJSDocNode?: number; // 2.0
    LastJSDocNode?: number; // 2.0
    FirstJSDocTagNode?: number; // 2.0
    LastJSDocTagNode?: number; // 2.0
    MergeDeclarationMarker?: number; // 2.1
    EndOfDeclarationMarker?: number; // 2.1
    RawExpression?: number; // 2.1
    LiteralType?: number; // 2.1
    JSDocLiteralType?: number; // 2.1
    JSDocNullKeyword?: number; // 2.1
    JSDocUndefinedKeyword?: number; // 2.1
    JSDocNeverKeyword?: number; // 2.1
    NotEmittedStatement?: number;
    PartiallyEmittedExpression?: number;
    FirstCompoundAssignment?: number;
    LastCompoundAssignment?: number;
  }

  export function current(): SyntaxKind.SyntaxKind {
    return ts.SyntaxKind;
  }
}

export = SyntaxKind;
