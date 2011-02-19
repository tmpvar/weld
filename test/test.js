
var assert     = require('assert')
    ,jsdom      = require('jsdom')
    ,fs         = require('fs')
    ,path       = require("path")
    ,jqpath     = path.join(__dirname, '..', 'demo', 'public', 'js', 'jquery.js')
    ,wpath      = path.join(__dirname, '..', 'lib', 'weld.js')
    ;

module.exports = {
  
  "Create markup from a template using an object literal that has one dimension": function(test) {

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
  
  "Create markup from a template using a bind parameter to explicitly map data to selectors": function(test) {
    
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
  
  "Create markup from a template with an alternate method of insertion": function(test) {
  
    jsdom.env({

      scripts: [jqpath, wpath],
      html: path.join(__dirname, 'files', 'contacts.html')

    },
    function(errors, window) {
    
      var $ = window.jQuery;    

      var data = [{ name: 'hij1nx',  title : 'code exploder' },
                  { name: 'tmpvar', title : 'code pimp' }];

      $('.contact').weld(data);
      $('.contact').weld(data, { method: "prepend" });
    
      test.ok($('.contact:first .name').text() == "tmpvar");
      test.done();

    });
  
  },
  
  "Create html from a template using a custom data mapping method": function(test) {
  
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
  
  "Append to a node that has already been the subject of a weld": function(test) {
  
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

      test.ok($('.contact .name').length > 2);
      test.done();
    });
  
  },
  
  "Create markup from an array of objects that have one dimention": function(test) {

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
  
  "Create markup from an object literal that has one dimention that contains are array of objects with one dimention": function(test) {

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
        map: function(el) {
          return el.addClass('pre-processed');
        }
      });

      test.ok($('.person').length === 2);

      //  Every node that gets iterated over should have a pre-processed class
      // (7 in total)

      test.ok($('.pre-processed').length === 7);
      test.done();
      
    });

  },
   
   "Create markup using form elements as the template": function(test) {

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
    }

};
