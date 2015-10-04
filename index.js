/*
    Implements translation to custom javascript subsets.

    @module
 */
var path = require('path');
var keywordsProvider = require('keywords-provider');
var esprima = require('esprima-custom-keywords');
var moduleDir = path.join('node_modules', 'your-script');
var lexems;

/**
 * Inverts given object, key: value -> value: key
 * @remark Be patient, may iterate over unexpected properties.
 *
 * @param {Object} object to invert
 * @returns {Object} object with inverted structure
 */
function invert(object) {
    var key;
    var dest = {};

    for (key in object) {
        dest[object[key]] = key;
    }

    return dest;
}

/**
 * Replaces the part of string with given substitute
 *
 * @param {String} s String to replace in
 * @param {Number} start starting index
 * @param {Number} end ending index
 * @param {String} substitute String to place instead of deleted part
 * @returns {String} String contains substitute instead of symbols in range given.
 */
function replace(s, start, end, substitute) {
    return s.substring(0, start) + substitute + s.substring(end);
}

/**
 * Main YourScript constructor. Does nothing except consuming configuration.
 *
 * @param {Object} config
 *   @config {String} lexemsFolder Path to lookup for keywords
 *   @config {String} from Subset to parse from
 *   @config {String} to Subset to parse to
 * @constructor
 */
function YourScript(config) {
    this.applyConfig(config || {});
}

/**
 * Main module prototype.
 */
YourScript.prototype = {

    /**
     * Applies given config.
     *
     * @param {Object} config
     *   @config {String} lexemsFolder Path to lookup for keywords
     *   @config {String} from Subset to parse from
     *   @config {String} to Subset to parse to
     */
    applyConfig: function(config) {
        this.lexemsFolder = config.lexemsFolder || path.join(moduleDir, 'lexems');
        this.sourceSubset = config.from || 'javascript';
        this.destinationSubset = config.to || 'yourscript';

        lexems = new keywordsProvider({
            folder: this.lexemsFolder
        });
    },

    /**
     * Parses the given string, translating it between subsets.
     *
     * @param {String} string Source to parse
     * @param {Object} options
     *   @config {String} from Subset to parse from
     *   @config {String} to Subset to parse to
     * @returns {String} translated source
     */
    parse: function (string, options) {
        // Forcing UTF-16
        string = String(string);
        options = options || {};

        this.sourceSubset = options.from || this.sourceSubset || 'javascript';
        this.destinationSubset = options.to || this.destinationSubset || 'yourscript';

        this.sourceKeywords = lexems.getKeywords(this.sourceSubset);
        this.destinationKeywords = lexems.getKeywords(this.destinationSubset);
        this.destinationMap = invert(this.destinationKeywords);
        this.sourceMap = invert(this.sourceKeywords);

        this.offset = 0;

        esprima.setKeywords(this.sourceKeywords);

        return this.replaceTokens(string, esprima.tokenize(string, {
            range: true
        }));
    },

    /**
     * Replaces tokens with their translations from preset subsets.
     *
     * @param {String} string source, contains tokens from source subset
     * @param {Object[]} tokens Array of esprima tokens to be used in replacing.
     * @returns {String} source, contains target subset tokens
     */
    replaceTokens: function(string, tokens) {
        var token;
        var i, ii;
        var start, end;

        for (i = 0, ii = tokens.length; i < ii; i++) {
            token = tokens[i];
            if (this.isTargetToken(token)) {
                start = this.applyOffset(token.range[0]);
                end = this.applyOffset(token.range[1]);

                string = replace(string, start, end, this.translate(token.value));
                this.incrementOffset(token.value);
            }
        }

        return string;
    },

    /**
     * Translates the keyword from the preset source subset to target subset.
     *
     * @param {String} keyword actual keyword value
     * @returns {String} translated keyword
     */
    translate: function(keyword) {
        return lexems.translate(keyword, this.sourceSubset, this.destinationSubset);
    },

    /**
     * Checks whether this token should be replaced or not.
     *
     * @param {Object} token esprima token
     * @returns {Boolean} true if should be replaced
     */
    isTargetToken: function(token)  {
        return token.type === 'Keyword' && this.sourceMap[token.value];
    },

    /**
     * Applies translation offset to the given position.
     *
     * @param {Number} position
     * @returns {Number} position with offset
     */
    applyOffset: function(position) {
        return position + this.offset;
    },

    /**
     * Increments translation offset (different subsets - different keyword length)
     *
     * @param {String} tokenValue
     */
    incrementOffset: function(tokenValue) {
        this.offset += lexems.getTranslationOffset(tokenValue, this.sourceSubset, this.destinationSubset);
    }
};

// That's it, your custom subsets are ready to be converted in all possible combinations.
module.exports = YourScript;