/*
  weld.js

  Template antimatter for javascript.

  Copyright hij1nx & Elijah Insua 2011
  Released under the MIT License
*/

;(function(window) {

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

  // EXPOSE
  window.weld = function(DOMTarget, data, pconfig) {

    var
    config = {
      alias : {},
      debug : false,
      method: false // Default to append
    },
    depth = 0,
    pad = function() {
      var l = depth, ret = '';
      while(l--) {
        ret += '    ';
      }
      return ret;
    },
    d = function() {
      if (config.debug) {
        var args = Array.prototype.slice.call(arguments);
        console.log(pad(), args.join(' '));
      }
    },
    go  = function(where, parent, element, key, value) {
      var label = where.toUpperCase(), debug = config.debug;
      if (debug) {
        console.log(pad(), label + '', 'parent:', parent + '', 'element:', element+'', 'key:', key + '', 'value:', value + '');
        depth+=1;
      }
      
      if (ops[where]) {

        var res = ops[where](parent, element, key, value);

        if (debug) {
          depth-=1;
          console.log(pad(), '/' + label, res + '', !!res);
        }
        return res;
      }

      if (config.debug) {
        depth-=1;
        console.log("OPERATION NOT FOUND: ", label);
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
            d("REMOVE TEMPLATE", template.tagName, 'class', template.className, 'id', template.id)
          } else if (array) {
            templateParent = template.originalParent;
          }

          keys = Object.keys(value);
          l = keys.length;
          for (i=0; i<l; i++) {
            key = keys[i];
            if (array) {
              // clone
              d('clone', element.tagName, element.className, element.id)
              target = element.cloneNode(true);
              go('traverse', templateParent, target, key, value[key]);
              go('insert', templateParent, target);

            } else {
              target = go('match', templateParent, element, key, value[key])
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