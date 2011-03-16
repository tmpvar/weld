
// another concept sandbox...

window.weld = function weld(el, data) { 

 function r(node, data, key) {

  var isArray = Object.prototype.toString.call(data) === '[object Array]';
  
  if(typeof data === 'object') {
    for(var k in data) {
      if(data.hasOwnProperty(k)) {
        r(node, data[k], k);
      }
    }
  }
  if(isArray) {

    var e = key === null ? node : node.querySelector('.' + key);

    for (var i = 0, len = data.length; i < len; i++) {
      var node = e.cloneNode(true);
      e.parentNode.insertBefore(node, e);
      if(typeof data[i] === 'object') { 
        r(e, data[i], key); 
      }
      else {
        node.textContent = data[i];
      }
    }
    e.parentNode.removeChild(e);
  }
  else if(isNaN(key) && typeof key !== 'object') {
    node.querySelector('.' + key).textContent = data;
  }
 }

 var fragment = document.createDocumentFragment(), t = el.cloneNode(true);
 fragment.appendChild(t);
 r(t, data, null);
 el.parentNode.insertBefore(fragment, el);
 el.parentNode.removeChild(el);
}
