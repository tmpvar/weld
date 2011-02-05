var tests      = module.exports = {};
    jsdom      = require("jsdom"),
    fs         = require("fs"),
    html       = function(file, cb) {
      fs.readFile(file, function(err, data) {
        if (err) {
          return cb(err);
        }

        var window = jsdom.html(data.toString()).createWindow();
        jsdom.jQueryify(window, __dirname + "/jquery.js", function() {
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
    
    t.done()
  });
}
