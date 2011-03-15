
;(function(window) {

  var config = {
    alias: false,
    debug: false,
    insert: false
  };

  window.weld = function weld(DOMTarget, data, p) {

    if(!DOMTarget || !data) {
      throw new Error("DOMTarget not found or data not specified");
    }
    p = p || {};
    config.insert = p.insert || false;
    config.map = p.map || false;
    config.template = DOMTarget.cloneNode(true);
    config.alias = p.alias || false;

    var fragment = document.createDocumentFragment();

    weld.ops.traverse(fragment, config.template, null, data);
    DOMTarget.parentNode.insertBefore(fragment.appendChild(config.template), DOMTarget);

    if(!config.insert) {
      while(e = DOMTarget.firstChild) { DOMTarget.removeChild(e); }
      DOMTarget.parentNode.removeChild(DOMTarget);
    }

    delete config.node;
  };

  weld.ops = {
    debug: false,
    traverse: function(parent, template, key, value) {

      if (typeof value === 'object') { // an object or an array
        for (var key in value) {
          if (value.hasOwnProperty(key)) {

            if(Object.prototype.toString.call(value[key]) === '[object Array]') {
              var el = template.getElementsByClassName(key)[0];
              parent = el.parentNode;
              template = el.cloneNode(true);
            } 
            this.traverse(parent, template, key, value[key]);
          }
        }
      }
      else if(isNaN(key*0)) { // a key's value, but not an array's value
        this.set(parent, template.getElementsByClassName(key), key, value);
      }
      else {
        var el = template.cloneNode(true);
        this.set(parent.appendChild(el), el, key, value);
      }
    },
    siblings: function() {},
    insert: function() {},
    elementType: function(parent, parent, element, key, value) {
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
    },
    map: function() {},
    set: function(parent, template, key, value) {

      template = template.nodeType ? [template] : template;

      var len = template.length;

      for(var i = 0; i < len; i++) {
        template[i].innerHTML = value;
      }
    },
    match: function() {}
  };   

})(window);






