
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

  var weld = window.weld = function(selector, data) {
    selector = (typeof selector === "string") ?
                  $(selector)                 :
                  selector;

    var walk = function(selector, key, data) {
      if (typeof data === "string") {
        apply(selector, key, data);
      } else if ($.isArray(data)) {
        var el, i, remove = selector[0];
        for (i = 0; i<data.length; i++) {
          el = $(selector[0].cloneNode(true));
          walk(el, key, data[i]);
          selector.parent().append(el);
        }
        $(remove).remove();
      } else {
        for (var a in data) {
          if (data.hasOwnProperty(a)) {
            walk(selector, a, data[a]);
          }
        }
      }
    }
    walk(selector, null, data);
  };

/*  var weld = window.weld = function(selector, source, callback) {
    
    var
    collection = (typeof selector === "string") ?
                  $(selector)                   :
                  selector,
    i,
    data,
    dk,
    el,
    clone;

    callback = callback || apply;
    
    if(typeof source === 'string') {
      
      if(source.indexOf('/') != -1) {
        
        fs.readFile(__dirname + source, (function (selector) {
          
          return function (err, content) {
            if (!err) {
              $(selector).html(content.toString());
            }

            if(callback) {
              callback(err, content);
            }
          }
        })(selector));
      }
      else {
        collection.text(source);
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
          weld(el, data[dk], callback);//callback(el, dk, data[dk]);
        }
      });
    }
  }*/
};