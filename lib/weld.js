
var sys = require('sys')
    ,fs = require('fs')
    ;

exports.setupWeld = function(window) {
  
  var $     = window.$,
      apply = function(el, key, value) {
        
        var selector = [

          '.' + key + ':first',
          '#' + key + ':first',
          ':input[name="' + key + '"]'
        ];

        child = $(selector.join(','), el);

        if (child.is(':input')) {
          child.val(value);
        } else if (child.is('img')) {
          child.attr('src', value);
        } else {
          child.text(value);
        }

        return el;
      };
  
  $.fn.weld = function(data, callback) { // A jQuery plugin
    
    weld(this, data, callback);
    return this;
  };

  var weld = window.weld = function(selector, source, callback) {
    
    var collection = $(selector), i, data, dk, el, clone;

    callback = callback || apply;
    
    if(typeof source === 'string') {
      
      if(source.indexOf('/') != -1) {
        
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
    } else if ($.isArray(source)) {
      
      for(i=0; i < source.length; i++) {
        data = source[i];
        var els = [];
        collection.toArray().map(function(v) {
          el = $(v);

          els.push(el);
          clone = $(el.get(0).cloneNode(true));

          for (dk in data) {
            clone = callback(clone, dk, data[dk]);
          }
          el.parent().append(clone);

        });
      }

      $(els).each(function() { $(this).remove() });

    } else {
      
      data = source;
      
      collection.each(function() {
        
        el = $(this);
        
        for (dk in data) {
          callback(el, dk, data[dk]);
        }
      });
    }
  }
};