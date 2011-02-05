
var sys = require('sys')
    ,fs = require('fs')
    ,weld = require('../lib/weld.js')
    ;

weld({

  '.whatever': { selector: '#someothershit' },
  '.name': { data: [{'name': 'bla'}, { 'name': 'foo' }] },
  
  '.foo': { file: '/foo.html' },
  '.bazz': {
    data: d.foo,
    map: function(node, data) {
      
      node.innerHTML = data.foo;
      return node;
    }
  },
  '#bar': { selector: '#bla' }

});
