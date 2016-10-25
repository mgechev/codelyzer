"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var cssLexer_1 = require('./cssLexer');
(function (BlockType) {
    BlockType[BlockType["Import"] = 0] = "Import";
    BlockType[BlockType["Charset"] = 1] = "Charset";
    BlockType[BlockType["Namespace"] = 2] = "Namespace";
    BlockType[BlockType["Supports"] = 3] = "Supports";
    BlockType[BlockType["Keyframes"] = 4] = "Keyframes";
    BlockType[BlockType["MediaQuery"] = 5] = "MediaQuery";
    BlockType[BlockType["Selector"] = 6] = "Selector";
    BlockType[BlockType["FontFace"] = 7] = "FontFace";
    BlockType[BlockType["Page"] = 8] = "Page";
    BlockType[BlockType["Document"] = 9] = "Document";
    BlockType[BlockType["Viewport"] = 10] = "Viewport";
    BlockType[BlockType["Unsupported"] = 11] = "Unsupported";
})(exports.BlockType || (exports.BlockType = {}));
var BlockType = exports.BlockType;
var CssAst = (function () {
    function CssAst(location) {
        this.location = location;
    }
    Object.defineProperty(CssAst.prototype, "start", {
        get: function () { return this.location.start; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CssAst.prototype, "end", {
        get: function () { return this.location.end; },
        enumerable: true,
        configurable: true
    });
    return CssAst;
}());
exports.CssAst = CssAst;
var CssStyleValueAst = (function (_super) {
    __extends(CssStyleValueAst, _super);
    function CssStyleValueAst(location, tokens, strValue) {
        _super.call(this, location);
        this.tokens = tokens;
        this.strValue = strValue;
    }
    CssStyleValueAst.prototype.visit = function (visitor, context) { return visitor.visitCssValue(this); };
    return CssStyleValueAst;
}(CssAst));
exports.CssStyleValueAst = CssStyleValueAst;
var CssRuleAst = (function (_super) {
    __extends(CssRuleAst, _super);
    function CssRuleAst(location) {
        _super.call(this, location);
    }
    return CssRuleAst;
}(CssAst));
exports.CssRuleAst = CssRuleAst;
var CssBlockRuleAst = (function (_super) {
    __extends(CssBlockRuleAst, _super);
    function CssBlockRuleAst(location, type, block, name) {
        if (name === void 0) { name = null; }
        _super.call(this, location);
        this.location = location;
        this.type = type;
        this.block = block;
        this.name = name;
    }
    CssBlockRuleAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssBlock(this.block, context);
    };
    return CssBlockRuleAst;
}(CssRuleAst));
exports.CssBlockRuleAst = CssBlockRuleAst;
var CssKeyframeRuleAst = (function (_super) {
    __extends(CssKeyframeRuleAst, _super);
    function CssKeyframeRuleAst(location, name, block) {
        _super.call(this, location, BlockType.Keyframes, block, name);
    }
    CssKeyframeRuleAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssKeyframeRule(this, context);
    };
    return CssKeyframeRuleAst;
}(CssBlockRuleAst));
exports.CssKeyframeRuleAst = CssKeyframeRuleAst;
var CssKeyframeDefinitionAst = (function (_super) {
    __extends(CssKeyframeDefinitionAst, _super);
    function CssKeyframeDefinitionAst(location, steps, block) {
        _super.call(this, location, BlockType.Keyframes, block, mergeTokens(steps, ','));
        this.steps = steps;
    }
    CssKeyframeDefinitionAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssKeyframeDefinition(this, context);
    };
    return CssKeyframeDefinitionAst;
}(CssBlockRuleAst));
exports.CssKeyframeDefinitionAst = CssKeyframeDefinitionAst;
var CssBlockDefinitionRuleAst = (function (_super) {
    __extends(CssBlockDefinitionRuleAst, _super);
    function CssBlockDefinitionRuleAst(location, strValue, type, query, block) {
        _super.call(this, location, type, block);
        this.strValue = strValue;
        this.query = query;
        var firstCssToken = query.tokens[0];
        this.name = new cssLexer_1.CssToken(firstCssToken.index, firstCssToken.column, firstCssToken.line, cssLexer_1.CssTokenType.Identifier, this.strValue);
    }
    CssBlockDefinitionRuleAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssBlock(this.block, context);
    };
    return CssBlockDefinitionRuleAst;
}(CssBlockRuleAst));
exports.CssBlockDefinitionRuleAst = CssBlockDefinitionRuleAst;
var CssMediaQueryRuleAst = (function (_super) {
    __extends(CssMediaQueryRuleAst, _super);
    function CssMediaQueryRuleAst(location, strValue, query, block) {
        _super.call(this, location, strValue, BlockType.MediaQuery, query, block);
    }
    CssMediaQueryRuleAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssMediaQueryRule(this, context);
    };
    return CssMediaQueryRuleAst;
}(CssBlockDefinitionRuleAst));
exports.CssMediaQueryRuleAst = CssMediaQueryRuleAst;
var CssAtRulePredicateAst = (function (_super) {
    __extends(CssAtRulePredicateAst, _super);
    function CssAtRulePredicateAst(location, strValue, tokens) {
        _super.call(this, location);
        this.strValue = strValue;
        this.tokens = tokens;
    }
    CssAtRulePredicateAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssAtRulePredicate(this, context);
    };
    return CssAtRulePredicateAst;
}(CssAst));
exports.CssAtRulePredicateAst = CssAtRulePredicateAst;
var CssInlineRuleAst = (function (_super) {
    __extends(CssInlineRuleAst, _super);
    function CssInlineRuleAst(location, type, value) {
        _super.call(this, location);
        this.type = type;
        this.value = value;
    }
    CssInlineRuleAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssInlineRule(this, context);
    };
    return CssInlineRuleAst;
}(CssRuleAst));
exports.CssInlineRuleAst = CssInlineRuleAst;
var CssSelectorRuleAst = (function (_super) {
    __extends(CssSelectorRuleAst, _super);
    function CssSelectorRuleAst(location, selectors, block) {
        _super.call(this, location, BlockType.Selector, block);
        this.selectors = selectors;
        this.strValue = selectors.map(function (selector) { return selector.strValue; }).join(',');
    }
    CssSelectorRuleAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssSelectorRule(this, context);
    };
    return CssSelectorRuleAst;
}(CssBlockRuleAst));
exports.CssSelectorRuleAst = CssSelectorRuleAst;
var CssDefinitionAst = (function (_super) {
    __extends(CssDefinitionAst, _super);
    function CssDefinitionAst(location, property, value) {
        _super.call(this, location);
        this.property = property;
        this.value = value;
    }
    CssDefinitionAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssDefinition(this, context);
    };
    return CssDefinitionAst;
}(CssAst));
exports.CssDefinitionAst = CssDefinitionAst;
var CssSelectorPartAst = (function (_super) {
    __extends(CssSelectorPartAst, _super);
    function CssSelectorPartAst(location) {
        _super.call(this, location);
    }
    return CssSelectorPartAst;
}(CssAst));
exports.CssSelectorPartAst = CssSelectorPartAst;
var CssSelectorAst = (function (_super) {
    __extends(CssSelectorAst, _super);
    function CssSelectorAst(location, selectorParts) {
        _super.call(this, location);
        this.selectorParts = selectorParts;
        this.strValue = selectorParts.map(function (part) { return part.strValue; }).join('');
    }
    CssSelectorAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssSelector(this, context);
    };
    return CssSelectorAst;
}(CssSelectorPartAst));
exports.CssSelectorAst = CssSelectorAst;
var CssSimpleSelectorAst = (function (_super) {
    __extends(CssSimpleSelectorAst, _super);
    function CssSimpleSelectorAst(location, tokens, strValue, pseudoSelectors, operator) {
        _super.call(this, location);
        this.tokens = tokens;
        this.strValue = strValue;
        this.pseudoSelectors = pseudoSelectors;
        this.operator = operator;
    }
    CssSimpleSelectorAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssSimpleSelector(this, context);
    };
    return CssSimpleSelectorAst;
}(CssSelectorPartAst));
exports.CssSimpleSelectorAst = CssSimpleSelectorAst;
var CssPseudoSelectorAst = (function (_super) {
    __extends(CssPseudoSelectorAst, _super);
    function CssPseudoSelectorAst(location, strValue, name, tokens, innerSelectors) {
        _super.call(this, location);
        this.strValue = strValue;
        this.name = name;
        this.tokens = tokens;
        this.innerSelectors = innerSelectors;
    }
    CssPseudoSelectorAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssPseudoSelector(this, context);
    };
    return CssPseudoSelectorAst;
}(CssSelectorPartAst));
exports.CssPseudoSelectorAst = CssPseudoSelectorAst;
var CssBlockAst = (function (_super) {
    __extends(CssBlockAst, _super);
    function CssBlockAst(location, entries) {
        _super.call(this, location);
        this.entries = entries;
    }
    CssBlockAst.prototype.visit = function (visitor, context) { return visitor.visitCssBlock(this, context); };
    return CssBlockAst;
}(CssAst));
exports.CssBlockAst = CssBlockAst;
var CssStylesBlockAst = (function (_super) {
    __extends(CssStylesBlockAst, _super);
    function CssStylesBlockAst(location, definitions) {
        _super.call(this, location, definitions);
        this.definitions = definitions;
    }
    CssStylesBlockAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssStylesBlock(this, context);
    };
    return CssStylesBlockAst;
}(CssBlockAst));
exports.CssStylesBlockAst = CssStylesBlockAst;
var CssStyleSheetAst = (function (_super) {
    __extends(CssStyleSheetAst, _super);
    function CssStyleSheetAst(location, rules) {
        _super.call(this, location);
        this.rules = rules;
    }
    CssStyleSheetAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssStyleSheet(this, context);
    };
    return CssStyleSheetAst;
}(CssAst));
exports.CssStyleSheetAst = CssStyleSheetAst;
var CssUnknownRuleAst = (function (_super) {
    __extends(CssUnknownRuleAst, _super);
    function CssUnknownRuleAst(location, ruleName, tokens) {
        _super.call(this, location);
        this.ruleName = ruleName;
        this.tokens = tokens;
    }
    CssUnknownRuleAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssUnknownRule(this, context);
    };
    return CssUnknownRuleAst;
}(CssRuleAst));
exports.CssUnknownRuleAst = CssUnknownRuleAst;
var CssUnknownTokenListAst = (function (_super) {
    __extends(CssUnknownTokenListAst, _super);
    function CssUnknownTokenListAst(location, name, tokens) {
        _super.call(this, location);
        this.name = name;
        this.tokens = tokens;
    }
    CssUnknownTokenListAst.prototype.visit = function (visitor, context) {
        return visitor.visitCssUnknownTokenList(this, context);
    };
    return CssUnknownTokenListAst;
}(CssRuleAst));
exports.CssUnknownTokenListAst = CssUnknownTokenListAst;
function mergeTokens(tokens, separator) {
    if (separator === void 0) { separator = ''; }
    var mainToken = tokens[0];
    var str = mainToken.strValue;
    for (var i = 1; i < tokens.length; i++) {
        str += separator + tokens[i].strValue;
    }
    return new cssLexer_1.CssToken(mainToken.index, mainToken.column, mainToken.line, mainToken.type, str);
}
exports.mergeTokens = mergeTokens;
