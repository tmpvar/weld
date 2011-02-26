var assert     = require('assert')
    ,jsdom      = require('jsdom')
    ,fs         = require('fs')
    ,path       = require("path")
    ,colors     = require("colors")
    ,jqpath     = path.join(__dirname, '..', 'demo', 'public', 'js', 'jquery.js')
    ,wpath      = path.join(__dirname, '..', 'lib', 'weld.js')
    ;

module.exports = {
  "Test 12: Stress test": function(test) {

    var fs = require('fs');
    var jsdom = require('jsdom');

    var html = fs.readFileSync(__dirname + "/files/test.html", 'utf8');
    for (var i = 0; i < 1000; i++) {
        jsdom.env(html, [jqpath, wpath],
        function(error, window) {
            var $ = window.jQuery;

            var data = {
                "name": "Test",
                "data": "hello"
            };

            window.weld($("#test")[0], data);
            console.log($("#test").html());
        });
    }
    test.done();
  }
};