
// another concept sandbox...

window.weld = function weld(el, data) { 

  function r(node, data, key) {

    if(typeof data === 'object') {
      for(var k in data) { // no hasOwnProp on purpose, extra props are inconsequential (plus, it's less than an ~80/20 case)
        r(node, data[k], k);
      }
    }

    if(Object.prototype.toString.call(data) === '[object Array]') {

      var e = key === null ? node : node.querySelector('.' + key);

      for (var i = 0, len = data.length; i < len; i++) {
        var node = e.cloneNode(true);
        e.parentNode.insertBefore(node, e);
        r(node, data[i], key); 
      }
      e.parentNode.removeChild(e);
    }
    else if(isNaN(key)) {
      node.querySelector('.' + key).textContent = data;
    }
  }

  var fragment = document.createDocumentFragment(), t = el.cloneNode(true), p = el.parentNode;
  fragment.appendChild(t);
  r(t, data, null);
  p.insertBefore(fragment, el);
  p.removeChild(el);
}
