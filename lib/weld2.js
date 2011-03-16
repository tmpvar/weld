

//
// weld2.js is a sandbox for some rough ideas regarding perf improvement...
//

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
    config.alias = p.alias || false;
    config.template = DOMTarget.cloneNode(true);    

    var fragment = document.createDocumentFragment();

    weld.ops.traverse(null, config.template, null, data);
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


      var data = { 'foo': { 'bar': ['a', 'b', { c: '1', d: '2' }] } };

      function r(data, searchkeys) {
        for(var key in data) {
          if(data.hasOwnProperty(key) && typeof data[key] === 'object') {
            r(data[key], searchkeys);
          }
        }
        for (var k = 0, klen = searchkeys.length; k < klen; k++) {
          if(searchkeys[k] in data) {
            if(Object.prototype.toString.call(data[searchkeys[k]]) === '[object Array]') {
              var arr = data[searchkeys[k]];
              for (var i = 0, len = arr.length; i < len; i++) {
                if(typeof arr[i] !== 'object') { console.log(searchkeys[k], ': ', arr[i]); }
              }
            }
            else if(typeof data[searchkeys[k]] !== 'object') {
              console.log(searchkeys[k], ': ', data[searchkeys[k]])
            }
          }
        }
      }

      r(data, ['bar', 'c'])


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
      else if(isNaN(key*0)) { // not an array.
        this.set(parent, template.getElementsByClassName(key)[0], key, value);
      }
      else { // an array.
        var el = template.cloneNode(true);
        this.set(parent.appendChild(el), el, key, value);
      }
    },
    siblings: function() {},
    insert: function() {},
    opType: function(parent, parent, element, key, value) {
      var nodeName = element.nodeName,
          input    = /input|select|textarea|option|button/i,
          image    = /img/i;

      if (typeof nodeName === "string") {
        if (input.test(nodeName)) {
          return 'value';
        }

        if (image.test(nodeName)) {
          return 'src';
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






