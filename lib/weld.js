
var sys = require('sys')
    ,fs = require('fs')
    ;

exports.setupWeld = function(window) {
  var $   = window.$,
      map = function(el, key, value) {
        $('.' + key).html(value);
        return el;
      };

  window.weld = function(selector, source, callback) {
    var collection = $(selector), i, data, dk, el, clone;

    callback = callback || map;
    if(typeof source === "string") {

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
    } else if ($.isArray(source)){
      for(i=0; i < source.length; i++) {
        data = source[i];
        $(collection.toArray()).each(function() {
          el = $(this)
          for (dk in data) {
            console.log(data[dk])
            clone = callback(el.clone(), dk, data[dk]);
            el.parent().append(clone);
          }
          el.remove();
        });
      }
    } else {
      data = source;
      collection.each(function() {
        el = $(this)
        for (dk in data) {
          callback(el, dk, data[dk]);
        }
      });
    }

    return this;
  }
};