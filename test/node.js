var tests      = module.exports = {};
    assert     = require('assert'),
    jsdom      = require("jsdom"),
    fs         = require("fs"),
    setupWeld  = require("../lib/weld").setupWeld,
    html       = function(file, cb) {
      fs.readFile(file, function(err, data) {
        if (err) {
          return cb(err);
        }

        var window = jsdom.html(data.toString()).createWindow();
        jsdom.jQueryify(window, __dirname + "/jquery.js", function() {
          // TODO: this is nasty, but quick.
          setupWeld(window);
          cb(null, window.weld, window.$, window);
        });
      })
    };

/*
  file
  selector
  map
  data
*/


tests.template_singular_instance = function(t) {
  html(__dirname + "/files/singular.html", function(err, weld, $, window) {
    
    var dummyData1 = [{ "key": "someKey", "value": "someValue" }];
    
    weld('#singular', dummyData1);    
    console.log($(".key").html())
    t.ok($(".key").html() === dummyData1[0].key);
    
    t.done();
  });
}






