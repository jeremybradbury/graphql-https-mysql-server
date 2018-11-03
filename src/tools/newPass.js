// generate a strong password that doesn't suck
var generate = require('xkcd-pass-plus');
module.exports = function(){
  var options = { 
    words: { dictionary: 'mixed', num: 4, min: 4, max: 8 },  // dictionary:
    // `xkcd` (2k memorable words ~44 bits entropy) 
    // `letterpress` (270k words >60 bits entropy) or 
    // `mixed` (default, 272k words ~80 bits entropy) 
    separator: ' ',
    paddingDigits: { after: 0 }, // default not 0
    paddingSymbols: { after: 0 } // default not 0
  };
  return generate(options).pass.toLowerCase();
};