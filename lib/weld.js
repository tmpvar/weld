/*
  weld.js

  Template antimatter for javascript.

  Copyright hij1nx & Elijah Insua 2011
  Released under the MIT License
*/

;(function(window) {
  var
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
    Configuration API. // Subject to additions...

    @member {string} method
      The jQuery method used to attach or remove the element(s).
    @member {bool} overwrite
      Determines if the weld should overwrite the existing childrem of the selected nodes.
    @member {object} alias
      Directly map keys of the data to css selectors.
  */
  config = {
    method : "append",
    // whether or not the previously rendered elements will be removed.
    overwrite : true,
    alias : {}
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
    weld.debug(1, "ENTERING SELECT");
    if (!ctx) { return false; }
    weld.debug(0, "SELECT...")
    /*
      Using the id, class, and name attribute queries we
      can cast a wider net and win more often.
    */
    var alias = config.alias[key] || key, els, len, e, collection, selector;

    // Run the query
    if(!ctx.querySelectorAll) {
      if (ctx.length && ctx[0]) {
        console.log(ctx.tagName)
        ctx = ctx[0];
        
      }
      els = ctx.getElementsByTagName('*');
      len = els.length;

      collection = [];

      while(len--) {
        e = els[len];
        weld.debug(0, 'LOOP', e.tagName)
        weld.debug(0, 'COMPARE','ID', e.id, alias);
        weld.debug(0, 'COMPARE','NAME', e.name, alias);
        weld.debug(0, 'COMPARE','CLASS', e.className, alias, e.className.split(' ').indexOf(alias));
        if(e.id == alias || e.name == alias) {
          collection.push(e);
        }
        else if(e.className.split(' ').indexOf(alias) !== -1) {
          weld.debug(0, "MET CLASS")
          collection.push(e);
        }
      }

      if (collection.length > 0) {
        weld.debug(-1, "/SELECT", collection.length)
        return collection;
      } else {
        weld.debug(0, 'MISSED COLLECTION', ctx.className, ctx.id, ctx.name, alias)
      }
    } else {
      
      selector = [
        '.' + alias,
        '#' + alias,
        ':input[name="' + alias + '"]'
      ].join(',');
      
      els = ctx.querySelectorAll(selector); 
      if (els.length > 0) {
        return els;
      }
    }
    weld.debug(-1, "EXIT SELECT", false)
    return false;
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
    weld.debug(1, 'APPLY', key, value)
    var child = (element)    ?
        select(key, element) :
        false,
        ret   = true;
    
    // To-Do: It appears that this block of code assumes a single child.
    // Need to clarify that the child will not actually be a collection.
    weld.debug(0, 'APPLY - CHILD', element.tagName, child)
    // If there were no children found, return false.
    if (child === false) {
      child = element;
    }

    // Handle input fields.
    if ((/input|select|textarea|button/i).test(child.tagName)) {
      val(child, value);

    // Handle IMG, set the src attribute.
    } else if (child) {

      if (nodeName(child, 'img')) {
        child.src = value;

      // For everything else, just set the text content.
      } else if(value && value.nodeType) {
        
        if(child.ownerDocument !== value.ownerDocument) {
          value = document.importNode(value);
        } else if (value.parentNode) {
          value.parentNode.removeChild(value);
        }

        child.appendChild(value);

      } else {

        while (child.firstChild) {
         child.removeChild(child.firstChild);
        }

        child.appendChild(document.createTextNode(value)); // Create a new text node with the new value
      }
    }
    weld.debug(-1, '/APPLY')
    return true; // TODO: space savings of a bit if we test for false explicitly
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
    console.log(parent.appendChild, parent.length)
    if (typeof m === "function") {
      m(parent, element);
    } else {
      parent.appendChild(element);
    }
  }
  ;

  /*
    @function {void} weld
      This is the entry point of a weld operation.

    @param {jQuery object} selector
      A jQuery selector.
    @param {object} data
      The data which will be used for the weld.
  */
  var weld = window.weld = function weld(collection, data, pconfig) {

    if(pconfig) {
      for(var p in pconfig) {
        if (pconfig.hasOwnProperty(p)) {
          config[p] = pconfig[p];
        }
      }
    }
    
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
   walk = function walk(selected, key, data) {
     weld.debug(1, "WALK")
      var result;
      selected = config.map ? config.map(selected, key, data) : selected;

      if (selected === false) {
        return false;
      }

      // String
      if (typeof data === "string") {
        weld.debug(0, "WELDING STRING")
        // end of the line, actually do some text placement
        result = apply(selected, key, data);
        weld.debug(-1, "/WALK", result)
        return result;

      // Array
      } else if (Object.prototype.toString.call(data) === '[object Array]') {
        weld.debug(0, "ARRAY")
        var el, i, remove = selected;
        // Only perform this operation if the selector
        // matches one or more elements
        // TODO: handle multiple selected items
        if (data.length > 0) {
          for (i = 0; i<data.length; i++) {
            /*
              Since this is a list, clone the first element in the selected
            */
            // TODO: multiple items 
            el = selected.cloneNode(true);

            /*
              Recurse Using:
                - The cloned element
                - The original key as this is a linear progression.
                - The current item in the data array
            */
            weld.debug(0, 'CLONE', el.tagName)
            result = walk(el, key, data[i]);
            
            // If walk fails, do not perform any other ops
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
              insert(selected[0].parentNode, el); // To-Do: remove jQuery dependency
            }
          }

          var els = remove, l = els.length;
          
          while(l--) {
            var el = els[l];
            if (!el._weld || !config.overwrite) {
              el.parentNode.removeChild(el);
            }
          }

        }

      // Object literal
      } else {
        weld.debug(0, "OBJECT LITERAL")
        for (childKey in data) {
          if (data.hasOwnProperty(childKey)) {
            // walk(selected, childKey, data[childKey])
            // continue;
            /*
              Recurse Using:
              - The nodes matching the current key (class/id/name)
              - The current key
              - The data held in the current key
            */

            found = select(childKey, selected);

            if (!found) {
              found = selected;
            } else if (found.length > 0) {
              var len = found.length;
              weld.debug(0, "READY TO FUCKING WRITE DUDE", childKey)
              //while (len--) {
                  walk(found[0] || found, childKey, data[childKey]);
              //}
            }
          }
        }

      }
      weld.debug(-1, "/WALK", true)
      return true;
    };

    // start welding!
    if (collection && collection.length) {
      var len = collection.length;
      while (len--) {
        walk(collection[len], null, data);
      }
    } else {
      walk(collection, null, data);
    }
  };

weld.currentDepth = 0;
weld.debug =  function(depthDelta) {
  if (depthDelta < 0) {
    weld.currentDepth += depthDelta;
  }
  var str = "";
  for (var i=0;i<weld.currentDepth; i++) {
    str += "    ";
  }

  if (depthDelta >= 0) {
    weld.currentDepth += depthDelta;
  }
  
  arguments[0] = str;
  console.log.apply(null, arguments);
  
};

})(window);
