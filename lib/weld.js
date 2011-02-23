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
  
  nodeName = function(elem, name) {
    return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
  },

  val = function(elem, value) {
    
    if (nodeName(elem, "option")) {
      var val = elem.attributes.value;
      return !val || val.specified ? elem.value : elem.text;
    }
    
    // We need to handle select boxes special
    if (nodeName(elem, "select")) {
      var index = elem.selectedIndex,
        values = [],
        options = elem.options,
        one = elem.type === "select-one";

      // Nothing was selected
      if (index < 0) {
        return null;
      }

			// Loop through all the selected options
			for (var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++) {
			  var option = options[i];

				// Don't return options that are disabled or in a disabled optgroup
				if (option.selected && (option.getAttribute("disabled") === null) &&
						(!option.parentNode.disabled || !nodeName(option.parentNode, "optgroup"))) {

					// Get the specific value for the option
					value = val(option);

					// We don't need an array for one selects
					if (one) {
						return value;
					}

					// Multi-Selects return an array
					values.push(value);
				}
			}

			return values;
		}

		if (/^(?:radio|checkbox)$/i.test(elem.type)) {
			return elem.getAttribute("value") === null ? "on" : elem.value;
		}

		// Everything else, we just grab the value
		return (elem.value = value).replace(/\r/g, "");

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
  select = function select(key, ctx) {
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
      if ($(ctx).is(selector)) {
        ret = ctx;
      } else {
        ret = false;
      }
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
  apply  = function apply(element, key, value) {
    // Attempt to collect a nested node
    var child = (element)    ?
        select(key, element) :
        false,
        ret   = true;
    
    // If there were no children found, return false.
    if (child === false) {
      ret = false;
    }

    // Handle input fields.
    if ((/input|select|textarea|button/i).test(child.tagName)) {
      val(child, value);

    // Handle IMG, set the src attribute.
    } else if (child) {
      if (nodeName(child, 'img')) {
        child.src = value;

      // For everything else, just set the text content.
      } else {
        $(child).text(value); // To-Do: remove jQuery dependency
      }
    }
    return ret;
  },

  /*

    @function {void} insert
      Inserts element into parent.

    @param {jQuery object} parent
      The parent of the current element.
    @param {DOMNode | jQuery object}
      the current element.
  */
  insert = function insert(parent, element) {
    var m = config.method;
    if (typeof m === "function") {
      m(parent, element)
    } else {
      parent[m](element);
    }
  },
  
  jquery = $.prototype.jquery
  ;

  /*
    @function {jQuery object}
      Turn weld into a very simple jQuery plugin.

    @param {object} data
      The data which will be used for the weld.
    @param {object} config
      A configuration object.
  */
  
  if(jquery) {  
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
  var weld = function weld(selector, data, pconfig) {

    if(!jquery && !window.weld.engine) {
      throw new Error('weld requires a selector engine!');
    }

    if(pconfig) {
      for(var p in pconfig) {
        if (pconfig.hasOwnProperty(p)) {
          config[p] = pconfig[p];
        }
      }
    }

    // Debug mode
    weld.debug = (config.debug) ? 
                  console.log   :
                  function() {} ;

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
    var walk = function walk(selected, key, data) {
      var result;
      selected = config.map ? config.map(selected, key, data) : selected;

      if (selected === false) {
        return false;
      }

      // String
      if (typeof data === "string") {
        // end of the line, actually do some text placement
        result = apply(selected[0], key, data);
        return result;

      // Array
      } else if (Object.prototype.toString.call(data) === '[object Array]') {
        var el, i, remove = selected;
        // Only perform this operation if the selector
        // matches one or more elements
        if (selected.length > 0) {
          for (i = 0; i<data.length; i++) {
            /*
              Since this is a list, clone the first element in the selected
            */
            el = selected[0].cloneNode(true); // To-Do: remove jQuery dependency

            /*
              Recurse Using:
                - The cloned element
                - The original key as this is a linear progression.
                - The current item in the data array
            */
            result = walk(el, key, data[i]);
            if (!result) {
              continue;
            }

            /*
              mark this element as being rendered, so the remove operation
              below will not remove this element. This also works for
              subsequent renders which will be in append mode
            */

            el._weld = {};

            /*
              Insert the element into the dom.

              cfg.method is used to determine the insertion type,
              this can be any method that the jQuery manipulation API supports.

            */
            if (selected && selected.length > 0) {
              insert(selected.parent(), el); // To-Do: remove jQuery dependency
            }
          }

          $(remove).each(function() { // To-Do: remove jQuery dependency
            if (!this._weld || !config.overwrite) {
              this.parentNode.removeChild(this);
            }
          });
        }

      // Object literal
      } else {
        var a, found;
        for (a in data) {
          if (data.hasOwnProperty(a)) {
            /*
              Recurse Using:
              - The nodes matching the current key (class/id/name)
              - The current key
              - The data held in the current key
            */
            
            found = select(a, selected);
            if (!found) {
              found = selected;
            }
            walk(found, a, data[a]);
          }
        }

      }
      return true;
    };

    // start welding!
    return walk(selector, null, data);
  };

  // EXPOSE
  window.weld = weld;

})(window);
