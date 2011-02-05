var tests      = module.exports = {};
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
          cb(null, window);
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
  html(__dirname + "/files/singular.html", function(err, window) {
    
    var weld       = window.weld,
        dummyData1 = [{ "key": "someKey", "value": "someValue" }];
    
    weld('#singular', dummyData1);    
    
    t.done();
  });
}






