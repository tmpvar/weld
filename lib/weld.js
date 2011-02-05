
var sys = require('sys')
    ,fs = require('fs')
    ;

exports.setupWeld = function(window) {
  var $   = window.$,
      map = function(el, key, value) {
        $('.' + key).html(value);
        return el;
      };
  $.fn.weld = function(data, callback) {
    weld(this, callback);
  };

  var weld = window.weld = function(selector, source, callback) {
    var collection = $(selector), i, data, dk, el, clone;

    callback = callback || map;
    if(typeof source === "string") {
      if(source.indexOf("/") != -1) {
        fs.readFile(__dirname + source, (function (selector) {
          return function (err, content) {
            $(selector).html(content.toString());
            if(callback) {
              callback(err, content);
            }
          }
        })(selector));
      }
      else {
        collection.html($(source).html());
      }
    } else if ($.isArray(source)){
      for(i=0; i < source.length; i++) {
        data = source[i];
        var parent = collection.parent(), els = [];
        collection.toArray().map(function(v) {
          el = $(v);
          els.push(el);
          clone = $(el.get(0).cloneNode(true));

          for (dk in data) {
            clone = callback(clone, dk, data[dk]);
          }
          el.parent().prepend(clone);

        });
      }

      $(els).each(function() { $(this).remove() });

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