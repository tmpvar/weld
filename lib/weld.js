
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
          console.log(pad(), '└ ' + element + '' + (!!res ? color.green + ' ✓' + color.gray : ' ✗')); // !!res ? !!parent : colorize(!!res)
        }
        return res;
      }

      if (config.debug) {
        depth-=1;
        d('○ OPERATION NOT FOUND: ', label);
      }
    },
    ops = {
      traverse : function(parent, element, key, value) {
        // LEAF
        if (typeof value === 'string') {
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
            template.originalParent = templateParent;
            templateParent.removeChild(template);
            d('○ REMOVE - element:', colorize(template), 'class:', colorize(template.className), 'id:', colorize(template.id));
          } else if (array) {
            templateParent = template.originalParent;
          }

          keys = Object.keys(value);
          l = keys.length;

          for (i=0; i<l; i++) {
            key = keys[i];
            
            if (array) {

              d('○ CLONE - element:', colorize(element), 'class:', colorize(element.className), 'id:', colorize(element.id));
              target = element.cloneNode(true);
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
          parent.appendChild(element);
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
      set : function(parent, element, key, value) {
        /*if(config.map && !config.map(elem, value, key)) {
          return false;
        }*/
        var type = go('elementType', parent, element, key, value), res = false;

        if (value && value.nodeType) { // imports.
          if (element.ownerDocument !== value.ownerDocument) {
            value = element.ownerDocument.importNode(value);
          } else if (value.parentNode) {
            value.parentNode.removeChild(value);
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
          rers = true;
        }
        return res;
      },
      match : function(parent, element, key, value) {
        key = config.alias[key] || key;

        if(element) {
          if(element.querySelectorAll) {
            selector = ['.' + key, '#' + key, '[name="' + key + '"]'].join(',');
            return element.querySelectorAll(selector)[0];
          }
          else {
            var els = element.getElementsByTagName('*'), l = els.length, e;

            while (l--) {
              e = els[l];
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