
;(function(window) {

  /*  Returns an array of all own enumerable properties found upon a given object, 
   *  in the same order as that provided by a for-in loop (the difference being that 
   *  a for-in loop enumerates properties in the prototype chain as well).
   */

  if(!Object.keys) {
    Object.keys = function(o){
      var ret=[],p;
      for(p in o) {
        if(Object.prototype.hasOwnProperty.call(o,p)) {
         ret.push(p);
        }
      }
      return ret;
    };
  }
  
  /*  Since weld runs browser/server, insure there is a console implementation.
   */

  window.console || (console = { log: function(){} });
  var color = { gray: '\033[37m', darkgray: '\033[40;30m', red: '\033[31m', green: '\033[32m', yellow: '\033[33m', 
                lightblue: '\033[1;34m', cyan: '\033[36m', white: '\033[1;37m' };

  /*  Weld!
   *  @param {HTMLElement} DOMTarget
   *    The target html node that will be used as the subject of data binding.
   *  @param {Object|Array} data
   *    The data that will be used.
   *  @param {Object} pconfig
   *    The configuration object.
   */
  window.weld = function(DOMTarget, data, pconfig) {

    var
    
    /*
     *  Configuration Object.
     *  @member {Object}
     *    Contains an explicit mapping of data-keys to element name/id/classes
     *  @member {Boolean}
     *    Determines if debugging will be enabled.
     *  @method {Boolean|Function}
     *    Determines the method of insertion, can be a functon or false.
     */
    
    config = {
      alias : {},
      debug : false,
      method: false // Default to append
    },
    
    /*  The current depth of the traversal, used for debugging.
     */
    
    depth = 0,
    
    /*  Generates padding used for indenting debugger statements.
     */
    
    pad = function() {
      var l = depth, ret = '';
      while(l--) {
        ret += ' │   ';
      }
      return ret;
    },
    
    /*  Debugger statement, terse, accepts any number of arguments 
     *  that are passed to a console.log statement.
     */
    
    d = function() {
      if (config.debug) {
        var args = Array.prototype.slice.call(arguments);
        console.log(pad(), args.join(' '));
      }
    },
    
    colorize = function(val) {
      var sval = val+'', u='undefined';
      if(navigator.userAgent.toLowerCase().indexOf('node.js') !== -1) {
        if(sval === 'false' || sval === 'null' || sval === '' || sval === u || typeof val === u || val === false) {
          if(sval === '') { sval = '(empty string)' };
          return color.red + sval + color.gray;
        }
        else {
          return color.yellow + sval + color.gray;
        }
      }
    },
    
    /*  An interface to the interal operations, implements common 
     *  debugging output based on a standard set of parameters.
     *  
     *  @param {String} where
     *    A function that is defined in the ops literal.
     *  @param {HTMLElement} parent
     *  @param {HTMLElement} element
     *  @param {String|undefined} key
     *    The key from the currently iterated object literal.
     *  @param {String|HTMLElement} value
     *
     */
    
    go  = function(where, parent, element, key, value) {
      var label = where.toUpperCase(), debug = config.debug;
      if (debug) {
        
        console.log(pad(), 
          (color.gray + '┌ ' + label + ' -'),
            'parent:', colorize(parent) + ',', 
            'element:', colorize(element) + ',', 
            'key:', colorize(key) + ',', 
            'value:', colorize(value));
        depth+=1;
      }
      
      if (ops[where]) {

        var res = ops[where](parent, element, key, value);

        if (debug) {
          depth-=1;
          console.log(pad(), '└ ' + element + '' + (res !== false ? color.green + ' ✓' + color.gray : ' ✗'));
        }
        return res;
      }

      if (config.debug) {
        depth-=1;
        d('○ OPERATION NOT FOUND: ', label);
      }
    },
    ops = {
      siblings : function(parent, element, key, value) {
        var remove = [],
        sibling,
        classes,
        cc,
        match,
        siblings = parent.children;
        cs = siblings.length; // Current Sibling
        element.weld = {
          parent  : parent,
          classes : element.className.split(' ')
        };

        // Find all siblings that match the exact classes that exist in the originally
        // matched element node
        while (cs--) {
          sibling = siblings[cs];

          if (sibling === element) {
            // If this is not the last item in the list, store where new items should be inserted
            if (cs < siblings.length) {
              element.weld.insertBefore = siblings[cs+1];
            }

            // remove the element here because siblings is a live list.
            // which means, if you remove it before hand, the length will mismatch and cause problems
            d('○ REMOVE - element:', colorize(element), 'class:', colorize(element.className), 'id:', colorize(element.id));

            parent.removeChild(element);

          // Check for the same class
          } else {
            classes      = sibling.className.split(' ');
            cc = classes.length;
            match        = true;
            while (cc--) {
              // TODO: optimize
              if (element.weld.classes.indexOf(classes[cc]) < 0) {
                match = false;
                break;
              }
            }

            // This element matched, you win a prize! DIE.
            if (match) {
              d('○ REMOVE - element:', colorize(sibling), 'class:', colorize(sibling.className), 'id:', colorize(sibling.id));
              parent.removeChild(sibling);
            }
          }
        }
      },
      traverse : function(parent, element, key, value) {
        // LEAF
        if (typeof value === 'string' || (value && value.nodeType)) {
          go('set', parent, element, key, value);
        // Object / Array-like
        } else {
          var
          target,
          i,
          keys, l,
          array = (value.length && value[0]),
          template = element,
          templateParent = element.parentNode;

          if (array && templateParent) {
            go('siblings', templateParent, template, key, value);
          } else if (array) {
            templateParent = template.weld.parent;
          }

          if (array) {
            l = value.length;
          } else if (typeof value === 'object') {
            keys = Object.keys(value);
            l = keys.length;
          }

          for (i=0; i<l; i++) {
            key = (keys) ? keys[i] : i;
            
            if (array) {

              d('○ CLONE - element:', colorize(element), 'class:', colorize(element.className), 'id:', colorize(element.id));
              target = element.cloneNode(true);
              target.weld = {};
              if (element.weld) {
                for (var weldParam in element.weld) {
                  if (element.weld.hasOwnProperty(weldParam)) {
                    target.weld[weldParam] = element.weld[weldParam];
                  }
                }
              }
              go('traverse', templateParent, target, key, value[key]);
              go('insert', templateParent, target);

            } else {
              target = go('match', templateParent, element, key, value[key]);
              if (target) {
                go('traverse', templateParent, target, key, value[key]);
              }
            }
          }
        }
      },
      insert      : function(parent, element) {
        if (typeof config.method === 'function') {
          config.method(parent, element);
        } else {
          if (element.weld && element.weld.insertBefore) {
            parent.insertBefore(element, element.weld.insertBefore);
          } else {
            parent.appendChild(element);
          }
        }
      },
      elementType : function(parent, element, key, value) {
        if (element) {
          var nodeName = element.nodeName,
              input    = /input|select|textarea|option|button/i,
              image    = /img/i;

          if (typeof nodeName === "string") {
            if (input.test(nodeName)) {
              return 'input';
            }

            if (image.test(nodeName)) {
              return 'image';
            }
          }
        }
      },
      map : function(parent, element, key, value) {
        return config.map(element, value, key);
      },
      set : function(parent, element, key, value) {
        
        if(config.map && go('map', parent, element, key, value) === false) {
          return false;
        }

        var type = go('elementType', parent, element, key, value), res = false;

        if (value && value.nodeType) { // imports.
          d('○ SET: value is', value.tagName);
          if (element.ownerDocument !== value.ownerDocument) {
            value = element.ownerDocument.importNode(value, true);
          } else if (value.parentNode) {
            value.parentNode.removeChild(value);
          }

          while (element.firstChild) { // clean first.
            element.removeChild(element.firstChild);
          }

          element.appendChild(value);
          res = true;
        }
        else if (type === 'input') { // special cases.
          element.setAttribute('value', value);
          res = true;
        }
        else if (type === 'image') {
          element.setAttribute('src', value);
          res = true;
        }
        else { // simple text assignment.
          while (element.firstChild) { // clean first.
            element.removeChild(element.firstChild);
          }
          element.appendChild(document.createTextNode(value)); // Create a new text node with the new value
          res = true;
        }
        return res;
      },
      match : function(parent, element, key, value) {

        if(config.alias[key]) {
          if(typeof config.alias[key] === 'function') {
            key = config.alias[key](parent, element, key, value);
          }
          else {
            key = config.alias[key];
          }
        }

        if(element) {
          if(element.querySelectorAll) {
            selector = ['.' + key, '#' + key, '[name="' + key + '"]'].join(',');
            return element.querySelectorAll(selector)[0];
          }
          else {
            var els = element.getElementsByTagName('*'), l = els.length, e, i;
            // find the _first_ best match
            for (i=0; i<l; i++) {
              e = els[i];
              if(e.id === key || e.name === key || e.className.split(' ').indexOf(key) > -1) {
                return e;
              }
            }
          }
        }
      }
    },
    parent = DOMTarget.parentNode;

    if(pconfig) {
      for(var p in pconfig) {
        if (pconfig.hasOwnProperty(p)) {
          config[p] = pconfig[p];
        }
      }
    }

    // Kick it off
    go('traverse', null, DOMTarget, null, data);

    if (config.debug) {
      console.log(parent.innerHTML);
    }
  };


})(window);