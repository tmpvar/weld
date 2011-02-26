var assert     = require('assert')
    ,jsdom      = require('jsdom')
    ,fs         = require('fs')
    ,path       = require("path")
    ,colors     = require("colors")
    ,jqpath     = path.join(__dirname, '..', 'demo', 'public', 'js', 'jquery.js')
    ,wpath      = path.join(__dirname, '..', 'lib', 'weld.js'),
    ,suite      = require(__dirname + "/suite").suite;

suite.getTemplate = function(name, fn) {
  
}