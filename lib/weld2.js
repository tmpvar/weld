
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
  var
  config = {
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

    if(p.alias) {
      config.alias = p.alias;
      config.template.keys = Object.keys(p.alias);
    }

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
    traverse: function(fragment, template, key, value) {

      if (typeof value === 'object') { // an object or an array
        for (var key in value) {
          if (value.hasOwnProperty(key)) {
            this.traverse(fragment, template, key, value[key]);
          }
        }
      }
      else if(isNaN(key*0)) { // a key's value, but not an array's value

        var n = template.getElementsByClassName(key),
            l = n.length;

        for(var i = 0; i < l; i++) {
          n[i].innerHTML = value;
        }
      }
      else {
        
      }
    },
    siblings: function() {},
    insert: function() {},
    elementType: function(fragment, parent, element, key, value) {
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
    set: function() {},
    match: function() {}
  };   

})(window);






