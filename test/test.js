
var assert     = require('assert')
    ,jsdom      = require('jsdom')
    ,fs         = require('fs')
    ,path       = require("path")
    ,colors     = require("colors")
    ,jqpath     = path.join(__dirname, '..', 'demo', 'public', 'js', 'jquery.js')
    ,wpath      = path.join(__dirname, '..', 'lib', 'weld.js')
    ;

module.exports = {
  
  "Test 1: Create markup from a template using an object literal that has one dimension": function(test) {

    jsdom.env({

      scripts: [jqpath, wpath],
      html: path.join(__dirname, 'files', 'singular.html')

    }, 
    function(errors, window) {

      var $ = window.jQuery;

      // some dummy data
      var data = {
        key   : 'someKey',
        value : 'someValue',
        icon  : '/path/to/image.png'
      };

      $('#singular').weld(data);
  
      test.ok($('.key').html() === data.key);
      test.ok($('.icon').attr('src') === data.icon);
      test.done();

    });
    
  },
  
  "Test 2: Create markup from a template using a bind parameter to explicitly map data to selectors": function(test) {
    
    jsdom.env({

      scripts: [jqpath, wpath],
      html: path.join(__dirname, 'files', 'contacts.html')

    },
    function(errors, window) {
  
      var $ = window.jQuery;    

      var data = [{ name: 'hij1nx',  title: 'code exploder' },
                  { name: 'tmpvar', title: 'code pimp' }];

      $('.contact').weld(data, { bind: { 'name': '.foo', 'title': '.title' } });

      test.ok($('.contact .foo:first').text().length > 1);
      test.done();
  
    });

  },
  
  "Test 3: Create markup from a template with an alternate method of insertion": function(test) {
  
    jsdom.env({

      scripts: [jqpath, wpath],
      html: path.join(__dirname, 'files', 'contacts.html')

    },
    function(errors, window) {
    
      var $ = window.jQuery;    

      var data = [{ name: 'hij1nx',  title: 'code exploder' },
                  { name: 'tmpvar', title: 'code pimp' }];

      $('.contact').weld(data, { method: "prepend" });
    
      test.ok($('.contact:first .name').text() == "tmpvar");
      test.done();

    });
  
  },
  
  "Test 4: Create html from a template using a custom data mapping method": function(test) {
  
    jsdom.env({

      scripts: [jqpath, wpath],
      html: path.join(__dirname, 'files', 'contacts.html')

    },
    function(errors, window) {  
    
      var $ = window.jQuery;    

      var times = 1;
      var data = [{ name: 'hij1nx',  title : 'code master' },
                  { name: 'tmpvar', title : 'code pimp' }];

      $('.contact').weld(data, {
      
        method: function(parent, newElement) {
          times++;
          parent.prepend(newElement);
        }
      
      });

      test.ok($('.contact').length == 2);
      test.ok($('.contact:nth(0) .name').text() == "tmpvar");
      test.done();
    
    });

  },  
  
  "Test 5: Append to a node that has already been the subject of a weld": function(test) {
  
    jsdom.env({

      scripts: [jqpath, wpath],
      html: path.join(__dirname, 'files', 'contacts.html')

    },
    function(errors, window) {  
    
      var $ = window.jQuery;    

      var data = [{ name: 'hij1nx',  title : 'manhatton' },
                  { name: 'tmpvar', title : 'brooklyn' }];

      $('.contact').weld(data);
      $('.contact').weld(data);

      // Bug Found: this is not returning the correct data, see console output.
      
      console.log('\r\n--- start debug on test #5 ---'.yellow)
      console.log($('body').html());
      console.log('--- end debug ---\r\n'.yellow);

      test.ok($('.contact .name').length > 2);
      test.done();
    });
  
  },
  
  "Test 6: Create markup from an array of objects that have one dimention": function(test) {

    jsdom.env({

      scripts: [jqpath, wpath],
      html: path.join(__dirname, 'files', 'contacts.html')

    },
    function(errors, window) {  

      var $ = window.jQuery;    

      var data = [{ name: 'hij1nx',  title : 'code exploder' },
                  { name: 'tmpvar', title : 'code wrangler' }];

      $('.contact').weld(data);

      test.ok($('.name:first').html() === data[0].name);
      test.done();
    
    });

  },
  
  
  "Test 7: Try to pair data with selectors that yield no matching elements": function(test) {

    jsdom.env({

      scripts: [jqpath, wpath],
      html: path.join(__dirname, 'files', 'contacts.html')

    },
    function(errors, window) {  

      var $ = window.jQuery;    

      var data = [{ x01h: 'hij1nx',  x0x1h: 'code exploder' },
                  { name: 'tmpvar', x0x1h: 'code wrangler' }];

      $('.contact').weld(data);
      
      console.log('\r\n--- start debug on test #7 ---'.yellow)
      console.log($('body').html());
      console.log('--- end debug ---\r\n'.yellow);      

      test.ok($('.contact:nth(0) .name').text() === "hij1nx");
      test.ok($('.contact:nth(1) .name').text() === "tmpvar");
      test.ok($('.contact:nth(2) .name').text() === "hij1nx");
      test.ok($('.contact:nth(3) .name').text() === "tmpvar");

      test.ok($('.contact:nth(0) .title').text() === "manhatton");
      test.ok($('.contact:nth(1) .title').text() === "brooklyn");
      test.ok($('.contact:nth(2) .title').text() === "manhatton");
      test.ok($('.contact:nth(3) .title').text() === "brooklyn");

      test.ok($('.contact .name').length === 4);
      test.done();

    });

  },  
  
  "Test 8: Create markup from an object literal that has one dimention that contains are array of objects with one dimention": function(test) {

    jsdom.env({

      scripts: [jqpath, wpath],
      html: path.join(__dirname, 'files', 'array-of-arrays.html')

    },
    function(errors, window) {  

      var $ = window.jQuery;    

      $('.people').weld({
        person : [
          {
            name : 'John',
            job  : [
              'guru', 'monkey', 'tester'
            ]
          },
          {
            name : 'Bob',
            job  : [
              'supervise', 'yell'
            ]
          }
        ]
      },
      {
        map: function(el, key, value) {
          return el.addClass('pre-processed');
        }
      });

      test.ok($('.person').length === 2);

      //  Every node that gets iterated over should have a pre-processed class
      // (7 in total)
      test.ok($('.pre-processed').length === 10);
      test.done();
      
    });

  },
   
   "Test 9: Create markup using form elements as the template": function(test) {

      jsdom.env({

        scripts: [jqpath, wpath],
        html: path.join(__dirname, 'files', 'form.html')

      },
      function(errors, window) {

        var $ = window.jQuery;    

        var data = {
          'email' : 'tmpvar@gmail.com'
        };

        $('form').weld(data);

        test.ok($(':input[name=email]').val() === data.email);
        test.done();

      });
    },
    "Test 10: Returning false from map stops the current branch from being visited" : function(test) {
      jsdom.env('<ul class="list"><li class="item">hello <span class="where">do not touch</span></li></ul>',[
        jqpath, wpath
      ], function(errors, window) {
        
        var $ = window.jQuery;
        
        $('.list .item').weld([
          { where : 'world' }
        ], {
          map : function(element, k, v) {
            return false;
          }
        });

        test.ok($('.where').text() === 'do not touch');
        test.done()
        
      });
    }
};
