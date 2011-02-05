
var sys = require('sys')
    ,fs = require('fs')
    ;

this.weld = function(config) {

  for(var o in config) {
    if(config[o].hasOwnProperty(o)) {

      var collection = $(o);

      if(config[o].file) {
        fs.readFile(config[o].file, function (err, content) {
          collection.html(content);
        });
      }
      else if(config[o].selector) {
        collection.html($(config[o].selector).html());
      }
      else if(config[o].map && config[o].data) {
        var data = config[o].data;
        for(var i=0; i < data; i++) {
          
          for(var el in collection) {
            if(collection[el].hasOwnProperty(el)) {
              config[o].map(el, config[o].data);
            }
          }

        }
      }

    }
  }

  return this;
  
};