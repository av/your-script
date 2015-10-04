# your-script
Module allows you to create your own subset of keywords for JavaScript

Do you ever dreamed of MeowScript or BroScript? Now it's easier then ever.

## Distribution
This module is distributed via npm, run `npm i your-script` just where you need it.

## Usage

#### Easy way:
```javascript
var yourScript = require('your-script');
var yoscript = new yourScript();

yoscript.parse('var barrio = foorio;');
```

And if you'll log the result of this operation, you'll see... No difference :) 
This happens due the default `.lex` configurations, there is no difference 
between `javascript.lex` and `yourscript.lex` by default.
So, the easiest way to change keywords is just edit `yourscript.lex`
in the way you like it and than translate everything from end to end.

This module is bundled with some dialects inside:
* geoscript — keywords are random places on earth
* meowscript — 50 shades of meow

#### True way:
This module assumed to be used for creating custom `.lex` definitions,
so create a folder somewhere, and put there `javascript.lex` 
(it's required for this module to work, default could be found in `lexems` folder), and
`literally-any-script.lex`, when instantiating the `yourScript` instance, just pass the path (yeah), in config object:
```javascript
var translator = new yourScript({
  lexemsFolder: './per/some/folder/ad/lexems'
  from: 'javascript',
  to: 'somescript'
});
```

Now you have a translator, which will replace all keywords in given source from `javascript` to `somescript` definitions.
If initial folder contains more then two file, it's totally ok, you can set the `source` and `destination` subsets right
before parsing:

```javascript
var translator = new yourScript({
  lexemsFoalder: './lexems'
});
```

and then...

```javascript
translator.parse(sourceString, {
  from: 'subset you source written in'
  to 'subset to translate your source to'
});
```

now we're ready to...

## How to create MeowScript
___

* `npm i your-script` somewhere you like it
* open `node_modules/your-script/lexems` folder
* create `meowscript.lex` file
* open `javascript.lex` somewhere nearby
* replace all the keywords! The order doesn't matters, just be imaginative :)
Example:
```txt
VAR meow
LET meoww
CONST meOw
FOR meowwr
...
```
* `var translator = require('your-script');`
* 
```javascript
meowScript = new translator({
  to: 'meowscript'
});
```

* Pass some source through it:
```txt
var kitty = new Kitty(); if (kitty.isHungry()) {kitty.feed()}
                            ||
                           \||/
                            \/
meow kitty = MEW Kitty(); meeow (kitty.isHungry()) {kitty.feed()}

```
* Have fun :)

## YourScript object interface:
```java
    /**
     * Applies given config.
     *
     * @param {Object} config
     *   @config {String} lexemsFolder Path to lookup for keywords
     *   @config {String} sourceSubset Subset to parse from
     *   @config {String} destinationSubset Subset to parse to
     */
    applyConfig: function(config)
    
    /**
     * Parses the given string, translating it between subsets.
     *
     * @param {String} string Source to parse
     * @param {Object} options
     *   @config {String} sourceSubset Subset to parse from
     *   @config {String} destinationSubset Subset to parse to
     * @returns {String} translated source
     */
    parse: function (string, options)
    
    /**
     * Replaces tokens with their translations from preset subsets.
     *
     * @param {String} string source, contains tokens from source subset
     * @param {Object[]} tokens Array of esprima tokens to be used in replacing.
     * @returns {String} source, contains target subset tokens
     */
    replaceTokens: function(string, tokens)
    
    /**
     * Translates the keyword from the preset source subset to target subset.
     *
     * @param {String} keyword actual keyword value
     * @returns {String} translated keyword
     */
    translate: function(keyword)
    
    /**
     * Checks whether this token should be replaced or not.
     *
     * @param {Object} token esprima token
     * @returns {Boolean} true if should be replaced
     */
    isTargetToken: function(token)
    
    /**
     * Applies translation offset to the given position.
     *
     * @param {Number} position
     * @returns {Number} position with offset
     */
    applyOffset: function(position)
    
    /**
     * Increments translation offset (different subsets - different keyword length)
     *
     * @param {String} tokenValue
     */
    incrementOffset: function(tokenValue)
```

## Under the hood.
This module uses esprima fork, which supports custom keywords, can be found at:

https://github.com/iamfrontender/esprima-custom-keywords

And small yet useful keywords-provider:

https://github.com/iamfrontender/keywords-provider

Cheers, mate!
