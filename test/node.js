var tests      = module.exports = {};
    jsdom      = require("jsdom"),
    fs         = require("fs"),
    weld       = require("../lib/weld"),
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
    
    var dummyData1 = [{ "key": "someKey", "value": "someValue" }];
    var dummyData2 = [{ "key": "fllasdasd", "value": "Asdase" }];    
    
    weld('#singular', dummyData1);
    weld('#other', dummyData2);

    // ...

    weld('#foo', "/foo.html", function(node) {});

    // ...

    weld('#singular', dummyData3, function() {});
    
    
    t.done()
  });
}






