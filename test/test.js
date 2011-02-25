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

      window.weld($('#singular')[0], data);

      test.ok($('.key').text() === data.key);
      test.ok($('.icon').attr('src') === data.icon);
      test.ok($(':input[name="value"]').val() === data.value);
      test.done();
      
    });
    
  },
  
  "Test 2: Create markup from a template using a alias parameter to explicitly map data to selectors": function(test) {
    
    jsdom.env({

      scripts: [jqpath, wpath],
      html: path.join(__dirname, 'files', 'contacts-alias.html')

    },
    function(errors, window) {
  
      var $ = window.jQuery;    

      var data = [{ name: 'hij1nx',  title: 'code exploder' },
                  { name: 'tmpvar', title: 'code pimp' }];

      window.weld($('.contact')[0], data, { 
        alias: { 
          'name': 'foo', 
          'title': 'title' 
        }
      });

      test.ok($('.contact').length === 2);

      test.ok($('.contact:nth(0) .foo').text() == "hij1nx");
      test.ok($('.contact:nth(1) .foo').text() == "tmpvar");

      test.ok($('.contact:nth(0) .title').text() == "code exploder");
      test.ok($('.contact:nth(1) .title').text() == "code pimp");

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

      window.weld($('.contact')[0], data, {
         method: function(parent, element) {
           parent.insertBefore(element, parent.firstChild);
         }
      });

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

      window.weld($('.contact')[0], data, {
      
        method: function(parent, newElement) {
          times++;
          $(parent).prepend(newElement);
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
    
      var
      $        = window.jQuery,
      data     = [{ name: 'hij1nx',  title : 'manhatton' },
                  { name: 'tmpvar', title : 'brooklyn' }],
      template = $('.contact')[0];

      window.weld(template, data);
      window.weld(template, data);

      test.ok($('.contact:nth(0) .name').text() === "hij1nx");
      test.ok($('.contact:nth(1) .name').text() === "tmpvar");
      test.ok($('.contact:nth(2) .name').text() === "hij1nx");
      test.ok($('.contact:nth(3) .name').text() === "tmpvar");

      test.ok($('.contact:nth(0) .title').text() === "manhatton");
      test.ok($('.contact:nth(1) .title').text() === "brooklyn");
      test.ok($('.contact:nth(2) .title').text() === "manhatton");
      test.ok($('.contact:nth(3) .title').text() === "brooklyn");
      test.ok($('.contact').length == 4);
      test.ok($('.contact .name').length == 4);
      test.ok($('.contact .title').length == 4);

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

      window.weld($('.contact')[0], data);
      test.ok($('.contact').length === 2);

      test.ok($('.contact:nth(0) .name').text() == "hij1nx");
      test.ok($('.contact:nth(1) .name').text() == "tmpvar");

      test.ok($('.contact:nth(0) .title').text() == "code exploder");
      test.ok($('.contact:nth(1) .title').text() == "code wrangler");
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

      window.weld($('.contact')[0], data);

      test.ok($('.name:nth(0)').text().indexOf('My Name') > -1);
      test.ok($('.title:nth(0)').text().indexOf('Leet Developer') > -1);

      test.ok($('.name:nth(1)').text().indexOf('tmpvar') > -1);
      test.ok($('.title:nth(1)').text().indexOf('Leet Developer') > -1);

      test.ok($('.contact').length === 2);

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

      window.weld($('.people')[0], {
        person: [
          {
            name: 'John',
            job: [
              'guru', 'monkey', 'tester'
            ]
          },
          {
            name: 'Bob',
            job: [
              'supervise', 'yell'
            ]
          }
        ]
      },
      {
        //debug: true,
        map: function(el, key, value) {
          return $(el).addClass('pre-processed');
        }
      });

      test.ok($('.person').length === 2);

      //  Every node that gets iterated over should have a pre-processed class
      // (7 in total)
      //test.ok($('.pre-processed').length === 10);
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
        test.done();
        
      });
    },
    "Test 11: Stress test": function(test) {

      var fs = require('fs');
      var jsdom = require('jsdom');

      var html = fs.readFileSync(__dirname + "/test.html", 'utf8');
      for (var i = 0; i < 1000; i++) {
          jsdom.env(html, [
          __dirname + '/jquery.js',
          __dirname + '/weld.js'
          ],
          function(error, window) {
              var $ = window.jQuery;

              var data = {
                  "name": "Test",
                  "data": "hello"
              };

              $("#test").weld(data);
              console.log($("#test").html());
          });
      }
      test.done();      
    }
};