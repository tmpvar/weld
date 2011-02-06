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
    selector = [
      '.' + key,
      '#' + key,
      ':input[name="' + key + '"]'
    ].join(','),
    ret = $(selector, ctx).first();

    if (ret.length < 1) {
      ret = $(ctx);
    }
    return ret;
  },
  apply  = function(el, key, value) {
    var child = select(key, el)

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
    selector = (typeof selector === "string") ?
                $(selector)                   :
                selector;

    var walk = function(selector, key, data) {

      if (typeof data === "string") { // if the data is a string.

        apply(selector, key, data);

      } else if ($.isArray(data)) { // if the data is an array.

        var el, i, remove = selector[0];
        if (remove) {
          for (i = 0; i<data.length; i++) {
            el = selector.clone(false);
            walk(el, key, data[i]);
            selector.parent().append(el);
          }
          $(remove).remove();
        }
      } else { // if the data is an object literal.
        for (var a in data) {
          if (data.hasOwnProperty(a)) {
            walk(select(a, selector), a, data[a]);
          }
        }
      }
      first = false;
    };
    walk(selector, null, data);
  };

  // EXPOSE
  window.weld = weld;

})(window);