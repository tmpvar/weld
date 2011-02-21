/*
  weld.js

  Template antimatter for javascript.

  Copyright hij1nx & Elijah Insua 2011
  Released under the MIT License
*/

;(function(window) {
  var
  $     = window.$,

  /*
    Configuration API. // Subject to additions...

    @member {string} method
      The jQuery method used to attach or remove the element(s).
    @member {bool} overwrite
      Determines if the weld should overwrite the existing childrem of the selected nodes.
    @member {object} bind
      Directly map keys of the data to css selectors.
  */
  config = {
    method : "append",
    // whether or not the previously rendered elements will be removed.
    overwrite : true,
    bind : {}
  },

  /*
    @function {jQuery object} select
      Collect a set of elements that the 'key' attribute matches in a
      class, id, or name attribute capacity.

    @param {string}
      the key of the data.
    @context {DOMNode | jQuery object}
      the context of the selection.
  */
  select = function(key, ctx) {
    var
    /*
      Using the id, class, and name attribute queries we
      can cast a wider net and win more often.
    */
    selector = config.bind[key] || [
      '.' + key,
      '#' + key,
      ':input[name="' + key + '"]'
    ].join(','),

    // Run the query
    ret = $(selector, ctx); // To-Do: remove jQuery dependency

    // If there are no results, use the incoming context as
    // the result.
    if (ret.length < 1) {
      ret = $(ctx); // To-Do: remove jQuery dependency
      ret.__nonmatch = true;
    }
    return ret;
  },

  /*
    @function {void} apply
      Apply the incoming value to element.

    @param {DOMNode | jQuery object} element
      the element to be apply to.
    @param {string} key
      the key of the current object.
    @param {string} value
      the value of the curent object.
  */
  apply  = function(element, key, value) {
    // Attempt to collect a nested node
    var child = select(key, element).first(); // To-Do: remove jQuery dependency

    // Handle input fields.
    if (child.is(':input')) { // To-Do: remove jQuery dependency
      child.val(value); // To-Do: remove jQuery dependency

    // Handle IMG, set the src attribute.
    } else if (child[0] && child[0].tagName.toLowerCase() == 'img') {
      child[0].setAttribute('src', value);

    // For everything else, just set the text content.
    } else {
      child.text(value); // To-Do: remove jQuery dependency
    }
  },

  /*

    @function {void} insert
      Inserts element into parent.

    @param {jQuery object} parent
      The parent of the current element.
    @param {DOMNode | jQuery object}
      the current element.
  */
  insert = function(parent, element) {
    if (typeof config.method === "function") {
      config.method(parent, element)
    } else {
      parent[config.method](element);
    }
  }
  ;

  /*
    @function {jQuery object}
      Turn weld into a very simple jQuery plugin.

    @param {object} data
      The data which will be used for the weld.
    @param {object} config
      A configuration object.
  */
  if($.prototype.jquery) {  
    $.fn.weld = function(data, config) {
      weld(this, data, config);
      return this;
    };
  }
  /*
    @function {void} weld
      This is the entry point of a weld operation.

    @param {jQuery object} selector
      A jQuery selector.
    @param {object} data
      The data which will be used for the weld.
  */
  var weld = function(selector, data, pconfig) {

    $.extend(config, pconfig || {}); // To-Do: remove jQuery dependency

    /*
      The incoming selector may be a string or jQuery object.
      Make sure that by the end of the next statement 'selector'
      is normalized to a jQuery object
    */
    selector = (typeof selector === "string") ?
                $(selector)                   : // To-Do: remove jQuery dependency
                selector;

    /*
      Walk takes a stroll (recursively) down the data structure in
      a depth first fashion. As it arrives at a data item it tests
      whether the value is a: string, array, or object.

      Strings:
        - Insert text content into the current element (via apply())

      Arrays:
        - Iterate over every item
        - clone item
        - recurse
        - append the clone
        - remove the original template

      Objects:
        - Iterate over every key
        - choose the next element
        - recurse
    */
    var walk = function(selected, key, data) {
      
      selected = config.map ? config.map(selected, key, data) : selected;

      if (selected === false) {
        return;
      }

      // String
      if (typeof data === "string") {

        if(selected.__nonmatch) {
          // if it's time for assignment and we don't have a match leave it alone   
          return;
        }
        else {
          apply(selected, key, data);
        }

        // end of the line, actually do some text placement
        

      // Array
      } else if (Array.isArray && Array.isArray(data) ||
          Object.prototype.toString.call(data) === '[object Array]') {
            
        var el, i, remove = selected;
        // Only perform this operation if the selector
        // matches one or more elements
        if (selected.length > 0) {
          for (i = 0; i<data.length; i++) {
            /*
              Since this is a list, clone the first element in the selected
            */

            el = selected.first().clone(false); // To-Do: remove jQuery dependency

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

            // el.data('rendered', true);
            el.__rendered = true;

            /*
              Insert the element into the dom.

              cfg.method is used to determine the insertion type,
              this can be any method that the jQuery manipulation API supports.

            */

            insert(selected.parent(), el); // To-Do: remove jQuery dependency
          }

          $(remove).each(function() {
            var e = $(this);
            if (!e.__rendered || !config.overwrite) {
              e.remove(); // To-Do: remove jQuery dependency
            }
          });
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
            walk(select(a, selected), a, data[a]);
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
