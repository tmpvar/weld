/*  weld.js

    Template antimatter for javascript

 *  Copyright hij1nx & Elijah Insua 2011
 *  Released under the MIT License
 */
;(function(window) {
  var
  $      = window.$,
  /*
    Collect a set of elements that the 'key' attribute matches in a
    class, id, or name attribute capacity.
    
    key is a string
    context is a DOMNode or jQuery object
    returns a jQuery object
  */
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
    
    // Run the query
    ret = $(selector, ctx);

    // If there are no results, use the incoming context as
    // the result
    if (ret.length < 1) {
      ret = $(ctx);
    }
    return ret;
  },
  /*
    Apply the incoming value to element
    
    element is a DOMNode or jQuery object
    key is a string
    value is a string
  */
  apply  = function(element, key, value) {
    // Attempt to collect a nested node
    var child = select(key, element).first();

    // Handle input fields
    if (child.is(':input')) {
      child.val(value);
    
    // Handle IMG, set the src attribute
    } else if (child.is('img')) {
      child.attr('src', value);
    
    // For everything else, just set the text content
    } else {
      child.text(value);
    }
  },
  /*
    Inserts el into parent
    
    parent is a jQuery object
    element is a DOMNode or jQuery object
  */
  insert = function(parent, element) {
    parent.append(element);
  };

  /*
    Turn weld into a very simple jQuery plugin
    
    data is an object
  */
  $.fn.weld = function(data) {
    weld(this, data);
    return this;
  };

  /*
    This is the entry point of a weld operation.
    
    selector is a jQuery object
    data is an object or string
  */
  var weld = function(selector, data) {
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
        // end of the line, actually do some text placement
        apply(selector, key, data);

      // Array
      } else if ($.isArray(data)) {
        var el, i, remove = selector;
        // Only perform this operation if the selector
        // matches one or more elements
        if (remove.length > 0) {
          for (i = 0; i<data.length; i++) {
            /*
              Since this is a list, clone the first element in the
              selector
            */
            
            el = selector.first().clone(false);
            
            /*
              Recurse Using:
              - The cloned element
              - The original key as this is a linear progression.
              - The current item in the data array
            */
            walk(el, key, data[i]);

            /*
              mark this element as being rendered, so the remove operation
              below will not remove this element. This also works for 
              subsequent renders which will be in append mode
            */
            el.data('rendered', true);

            /*
              Insert the element into the dom.
              
              The default is append
              TODO: this needs to be configurable
            */
            insert(selector.parent(), el);
          }

          // TODO: make configurable for append only operations
          $(remove).remove();
        }

      // Object literal
      } else {
        for (var a in data) {
          if (data.hasOwnProperty(a)) {
            /*
              Recurse Using:
              - The nodes matching the current key (class/id/name)
              - The current key
              - The data held in the current key
            */
            walk(select(a, selector), a, data[a]);
          }
        }

      }
    };
    
    // start welding!
    walk(selector, null, data);
  };

  // EXPOSE
  window.weld = weld;

})(window);