var weld2 = require('../lib/weld2').Weld2;

// test...

var data = { 
  'test': 'Hello, World.'
};

var html = '<p id="test" class="foo test">asd<i>world</i></p>'; 

console.log(weld2(html, data).html());
