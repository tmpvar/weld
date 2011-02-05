
var sys = require('sys')
    ,fs = require('fs')
    ;

exports.setupWeld = function(window) {
  var $ = window.$;

  window.weld = function(selector, source, callback) {

    var collection = $(selector);

    if(typeof source == "stirng") {

      if(source.indexOf("/")) {
        fs.readFile(source, function (err, content) {
          collection.html(content);
          if(callback) {
            callback(content);
          }
        });      
      }
      else {
        collection.html($(source).html());      
      }
    }
    else {

      for(var i=0; i < source.length; i++) {
        for(var el in collection) {
          if(collection[el].hasOwnProperty(el)) {
          
            if(callback) {
              callback(collection[el], source[i]);
            }
            else {
              $(collection[el]).html(source[i]);
            }
          }
        }
      }
    }

    return this;
  }
};