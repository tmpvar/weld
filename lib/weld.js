
;(function(window) {

  var config = {
    alias: {}
  };
  
  var fragment = document.createDocumentFragment();

  function nodeName(elem, name) {
    if(typeof name !== 'string') {

      return elem.nodeName && name.test(elem.nodeName.toLowerCase());
    }
    else {
      return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
    }
  }

  function assignVal(elem, value, key) {

    if(config.map && !config.map(elem, value, key)) {
      return false;
    }

    while (elem.firstChild) { // clean first.
     elem.removeChild(elem.firstChild);
    }

    if (value && value.nodeType) { // imports.
      if (elem.ownerDocument !== value.ownerDocument) {
        value = document.importNode(value);
      } else if (value.parentNode) {
        value.parentNode.removeChild(value);
      }

      elem.appendChild(value);
    }
    else if (nodeName(elem, /input|select|textarea|option|button/i)) { // special cases.
      elem.setAttribute('value', value);
    }
    else if (nodeName(elem, 'img')) {
      elem.setAttribute('src', value);
    }
    else { // simple text assignment.
      elem.appendChild(document.createTextNode(value)); // Create a new text node with the new value    
    }
  }

  function assignData(key, data, target) {

    var alias = config.alias[key] || key,
       els, 
       len, 
       e, 
       selector;

    if(!target.getElementsByTagName) {
      return false; // the target is not valid.
    } 
    else if(target.querySelectorAll) {
      selector = [
        '.' + alias,
        '#' + alias,
        '[name="' + alias + '"]'
      ].join(',');

      els = target.querySelectorAll(selector);
    } 
    else {
      els = target.getElementsByTagName('*');
      len = els.length;
    }
    
    while(len--) {
      e = els[len];
      if(e.id == alias || e.name == alias) {
        assignVal(e, data, key);
        fragment.appendChild(target);        
      }
      else if(e.className.split(' ').indexOf(alias) !== -1) {
        assignVal(e, data, key);
        fragment.appendChild(target);        
      }
    }    

    return true;
  }

  function recurseData(data, key, target) {

    if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") { // Value
      assignData(key, data, target);
    }
    else if (Object.prototype.toString.call(data) === '[object Array]') { // Array

      var index = data.length;
      while(index--) {
        recurseData(data[index], null, target.cloneNode(true));
      }
    }
    else {

      for(var kkey in data) {
        if (data.hasOwnProperty(kkey)) {
          recurseData(data[kkey], kkey, target);
        }
      } 
    }
  }

  function weld(DOMTarget, data, pconfig) {
    
    if(pconfig) {
      for(var p in pconfig) {
        if (pconfig.hasOwnProperty(p)) {
          config[p] = pconfig[p];
        }
      }
    }
    
    var target;
    
    // this could get cleaned up a bit...
    if(DOMTarget.length) {
      var i = DOMTarget.length, clone, parent;
      while(i--) {
        parent = DOMTarget[i].parentNode;
        clone = DOMTarget[i].cloneNode(true);
        DOMTarget[i].parentNode.removeChild(DOMTarget[i]);
        recurseData(data, null, clone);
        parent.appendChild(fragment.cloneNode(true));
      }
    }
    else {
      var clone = DOMTarget[i].cloneNode(true), parent = DOMTarget.parentNode;
      DOMTarget.parentNode.removeChild(DOMTarget);
      recurseData(data, null, clone);
      parent.appendChild(fragment.cloneNode(true));
    }

  }

  window.weld = weld;

})(window);