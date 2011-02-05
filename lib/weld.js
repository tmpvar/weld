
var sys = require('sys')
    ,fs = require('fs')
    ;

exports.setupWeld = function(window) {

  var 
  $     = window.$,
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

  var weld = window.weld = function(selector, data, callback) {
    selector = (typeof selector === "string") ?
                  $(selector)                 :
                  selector;

    var walk = function(selector, key, data) {

      if (typeof data === "string") { // if the data is a string.

        apply(selector, key, data);

      } else if ($.isArray(data)) { // if the data is an array.
        
        var el, i, remove = selector[0];
        for (i = 0; i<data.length; i++) {
          el = $(selector[0].cloneNode(true));
          walk(el, key, data[i]);
          selector.parent().append(el);
        }
        $(remove).remove();
        
      } else { // if the data is an object literal.
        
        for (var a in data) {
          if (data.hasOwnProperty(a)) {
            walk(selector, a, data[a]);
          }
        }
      }
      first = false;
    };
    walk(selector, null, data);
      
  };

};