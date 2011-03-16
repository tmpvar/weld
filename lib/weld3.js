
// another concept sandbox...

// weld3.js
// Profile (1.072ms, 20 calls)
// Profile (1.085ms, 20 calls)
// Profile (1.084ms, 20 calls)
// Profile (1.246ms, 20 calls)
// Profile (1.137ms, 20 calls)
// Profile (1.104ms, 20 calls)

// weld.js
// Profile (2.284ms, 71 calls)
// Profile (2.336ms, 71 calls)
// Profile (2.323ms, 71 calls)
// Profile (2.329ms, 71 calls)
// Profile (2.271ms, 71 calls)
// Profile (2.335ms, 71 calls)

window.weld = function weld(el, data) { 

 function r(data, key) {
  
  var isArray = Object.prototype.toString.call(data) === '[object Array]';
  
  if(typeof data === 'object') {
    for(var k in data) {
      if(data.hasOwnProperty(k)) {
        r(data[k], k);
      }
    }
  }
  if(isArray) {
    var e = t.querySelector('.' + key);

    for (var i = 0, len = data.length; i < len; i++) {
      if(typeof data[i] !== 'object') {
        var node = e.cloneNode(true);
        node.textContent = data[i];
      e.parentNode.insertBefore(node, e);
      }
    }
    e.parentNode.removeChild(e);
  }
  else if(isNaN(key) && typeof key !== 'object') {
    t.querySelector('.' + key).textContent = data;
  }
 }

 var fragment = document.createDocumentFragment(), t = el.cloneNode(true);
 r(data, t);
 try {
   el.parentNode.insertBefore(fragment.appendChild(t), el);
 }
 catch(ex) {
   throw new Error(">>>" + el.tagName)
 }
 el.parentNode.removeChild(el);
}
