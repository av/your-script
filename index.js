var fs = require('fs');
var path = require('path');
var keywordsProvider = require('keywords-provider');
var esprima = require('esprima-custom-keywords');
var moduleDir = path.join(path.dirname(process.mainModule.filename), '../');
var lexems;

function invert(object) {
    var key;
    var dest = {};

    for (key in object) {
        dest[object[key]] = key;
    }

    return dest;
}

function merge(target, source) {
    var key;

    for (key in source) {
        target[key] = source[key];
    }
}

function replace(s, start, end, substitute) {
    return s.substring(0, start) + substitute + s.substring(end);
}

function YourScript(config) {
    this.applyConfig(config);
}

YourScript.prototype = {

    applyConfig: function() {
        this.lexemsFolder = config.lexemsFolder || path.join(moduleDir, 'lexems');
        this.sourceSubset = config.sourceSubset || 'javascript';
        this.destinationSubset = config.destinationSubset || 'yourscript';

        lexems = new keywordsProvider({
            folder: this.lexemsFolder
        });
    },

    parse: function (string, options) {
        // Forcing UTF-16
        string = String(string);
        options = options || {};

        this.sourceSubset = options.sourceSubset || 'javascript';
        this.destinationSubset = options.destinationSubset || 'yourscript';

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

    translate: function(keyword) {
        return lexems.translate(keyword, this.sourceSubset, this.destinationSubset);
    },

    isTargetToken: function(token)  {
        return token.type === 'Keyword' && this.sourceMap[token.value];
    },

    applyOffset: function(position) {
        return position + this.offset;
    },

    incrementOffset: function(tokenValue) {
        this.offset += lexems.getTranslationOffset(tokenValue, this.sourceSubset, this.destinationSubset);
    }
};

module.exports = YourScript;