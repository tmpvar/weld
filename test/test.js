var assert     = require('assert')
    ,jsdom      = require('jsdom')
    ,fs         = require('fs')
    ,path       = require("path")
    ,colors     = require("colors")
    ,jqpath     = path.join(__dirname, '..', 'demo', 'public', 'js', 'jquery.js')
    ,suite      = require(__dirname + "/suite").suite;
    ,wpath      = require('weld').filepath
    ;

suite.getTemplate = function(name, fn) {
  
}
