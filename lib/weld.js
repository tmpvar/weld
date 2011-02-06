/*  weld.js

    Template antimatter for javascript

 *  Copyright hij1nx & Elijah Insua 2011
 *  Released under the MIT License
 */
;(function(window) {
  var
  $      = window.$,
  select = function(key, ctx) {
    var
    /*
      Using the id, class, and name attribute queries we
      can cast a wider net and win more often.
    */
    selector = [
      '.' + key,
      '#' + key,
      ':input[name="' + key + '"]'
    ].join(','),
    
    ret = $(selector, ctx);

    if (ret.length < 1) {
      ret = $(ctx);
    }
    return ret;
  },
  apply  = function(el, key, value) {
    
    var child = select(key, el).first();

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

  var weld = function(selector, data, callback) {
    /*
      The incoming selector may be a string or jQuery object.
      Make sure that by the end of the next statement 'selector'
      is normalized to a jQuery object
    */
    selector = (typeof selector === "string") ?
                $(selector)                   :
                selector;

    /*
      Walk takes a stroll (recursively) down the data structure in
      a depth first fashion. As it arrives at a data item it tests
      whether the value is a: string, array, or object.
      
      Strings: 
        - Insert text content into the current element (via apply())

      Arrrays: 
        - Iterate over every item
        - clone item
        - recurse
        - append the result
        - remove the original template

      Objects:
        - Iterate over every key
        - choose the next element
        - recurse
    */
    var walk = function(selector, key, data) {
      // String
      if (typeof data === "string") {
        apply(selector, key, data);

      // Array
      } else if ($.isArray(data)) {
        var el, i, remove = selector;
        if (remove[0]) {
          for (i = 0; i<data.length; i++) {
            el = selector.first().clone(false);
            walk(el, key, data[i]);
            selector.parent().append(el);
          }
          /*
            Clean off the existing
          */
          $(remove).remove();
        }

      // Object literal
      } else { 
        for (var a in data) {
          if (data.hasOwnProperty(a)) {
            walk(select(a, selector), a, data[a]);
          }
        }

      }
    };
    walk(selector, null, data);
  };

  // EXPOSE
  window.weld = weld;

})(window);