var assert     = require('assert')
    ,jsdom      = require('jsdom')
    ,fs         = require('fs')
    ,path       = require("path")
    ,colors     = require("colors")
    ,jqpath     = path.join(__dirname, '..', 'demo', 'public', 'js', 'jquery.js')
    ,wpath      = path.join(__dirname, '..', 'lib', 'weld.js')
    ;

module.exports = {
  "Test 1: Sanity" : function(test) {
    jsdom.env("<a class='link'></a>", [jqpath, wpath], function(errors, window) {
      var $ = window.$;

      window.weld(window.document.body, { link : "text" }, {
        set : function(parent, element, key, value) {
          $(element).text("woo");
        },
      });

      test.ok($('a').text() === "woo");
      test.done();
    });
  },
  "Test 2: Assign data to elements using an object literal that has one dimension": function(test) {

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
  
  "Test 3: Generate markup based on an element using the alias parameter to explicitly correlate data-keys and elements": function(test) {
    
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
  
  "Test 4: Generate markup based on an element using an (alias w/function) parameter to explicitly correlate data and elements": function(test) {
    
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
          'name' : function(parent, element, key, value) { 
            // Sanity
            test.ok(key === 'name');

            return 'foo';
          },
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
  
  "Test 5: Generate markup from an element with an alternate method of insertion": function(test) {
  
    jsdom.env({

      scripts: [jqpath, wpath],
      html: path.join(__dirname, 'files', 'contacts.html')

    },
    function(errors, window) {
    
      var $ = window.jQuery;

      var data = [{ name: 'hij1nx',  title: 'code exploder' },
                  { name: 'tmpvar', title: 'code pimp' }];

      window.weld($('.contact')[0], data, {
         insert: function(parent, element) {
           parent.insertBefore(element, parent.firstChild);
         }
      });

      test.ok($('.contact').length === 2);

      test.ok($('.contact:nth(0) .name').text() == "tmpvar");
      test.ok($('.contact:nth(1) .name').text() == "hij1nx");

      test.ok($('.contact:nth(0) .title').text() == "code pimp");
      test.ok($('.contact:nth(1) .title').text() == "code exploder");
      test.done();
    });

  },

  "Test 6: Generate markup based on an element using a custom data mapping method": function(test) {
  
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
      
        insert: function(parent, newElement) {
          times++;
          $(parent).prepend(newElement);
        }
      
      });

      test.ok($('.contact').length == 2);
      test.ok($('.contact:nth(0) .name').text() == "tmpvar");
      test.done();

    });

  },  
  
  "Test 7: Append to a node that has already been the subject of a weld": function(test) {
  
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
  
  "Test 8: Create markup from an array of objects that have one dimention": function(test) {

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
  
  "Test 9: Try to pair data with selectors that yield no matching elements": function(test) {

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

  "Test 10: Create markup from an object literal that has one dimention that contains are array of objects with one dimention": function(test) {

    jsdom.env({

      scripts: [jqpath, wpath],
      html: path.join(__dirname, 'files', 'array-of-arrays.html')

    },
    function(errors, window) {  

      var $ = window.jQuery;
      // TODO: remove siblings who match .person
      /*
        * it is impossible to do explicit maching (even/odd)
      
        SIDECASE FIX0r
        - when matching arrays
        - capture the className
        - compare with siblings[*].className (be aware of ordering!)
        - remove COMPLETE matches
      
      */
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
        ],
        bar : "hello"
      },
      {
        map: function(el, key, value) {
          $(el).addClass('pre-processed');
        }
      });

      test.ok($('.person').length === 4);

      test.ok($('.person:nth(0) .name').text() === 'John');
      test.ok($('.person:nth(0) .job').length === 3);

      test.ok($('.person:nth(1) .name').text() === 'Bob');
      test.ok($('.person:nth(1) .job').length === 2);

      test.ok($('.person.bar').text() === "hello");
      test.ok($('.person.bar').length === 1);
      
      test.ok($('.person.submit').length === 1);
      test.ok($('.person.submit').text() === "Sidecase #2: additional classes (no data equiv)");
      //  Every node that gets iterated over should have a pre-processed class
      // (7 in total)
      //test.ok($('.pre-processed').length === 10);
      test.done();
      
    });

  },
   
   "Test 11: Create markup using form elements as the template": function(test) {

      jsdom.env({

        scripts: [jqpath, wpath],
        html: path.join(__dirname, 'files', 'form.html')

      },
      function(errors, window) {

        var $ = window.jQuery;

        var data = {
          'email' : 'tmpvar@gmail.com'
        };

        window.weld($('form')[0], data);

        test.ok($(':input[name=email]').val() === data.email);
        test.done();

      });
    },
    "Test 12: Returning false from map stops the current branch from being visited" : function(test) {
      jsdom.env('<ul class="list"><li class="item">hello <span class="where">do not touch</span></li></ul>',[
        jqpath, wpath
      ], function(errors, window) {
        
        var $ = window.jQuery;
        
        window.weld($('.list .item')[0], [
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
    "Test 13: Use a NodeList from another document and weld it into the target document" : function(test) {
      jsdom.env(path.join(__dirname, 'files', 'source.html'), function(serrs, sw) {
        var sources = sw.document.getElementsByTagName("span");

        jsdom.env(path.join(__dirname, 'files', 'dest.html'),[jqpath, wpath], function(errors, window) {
          var $ = window.jQuery;

          window.weld($('li.number')[0], sources);

          test.ok($('li.number').length === 3);
          test.ok($('li.number:nth(0) span').text() === "zero");
          test.ok($('li.number:nth(1) span').text() === "one");
          test.ok($('li.number:nth(2) span').text() === "two");
          test.ok($('li.number').text() === "zeroonetwo");
          test.done();
        });
      });
    },
    "Test 14: Use a NodeList from the current document and weld it to another area in the same document" : function(test) {
      jsdom.env(path.join(__dirname, 'files', 'source-and-dest.html'),[jqpath, wpath], function(errors, window) {
        var $       = window.jQuery,
            sources = window.document.getElementById('data').getElementsByTagName("span");

        window.weld($('li.number')[0], sources);

        test.ok($('li.number').length === 3);
        test.ok($('li.number:nth(0) span').text() === "zero");
        test.ok($('li.number:nth(1) span').text() === "one");
        test.ok($('li.number:nth(2) span').text() === "two");
        test.ok($('li.number').text() === "zeroonetwo");
        test.done();
      });
    },
    "Test 15: Alias may return a dom element which is used instead of doing an explicit match": function(test) {

      jsdom.env(path.join(__dirname, 'files', 'contacts-alias.html'), [jqpath, wpath],  function(errors, window) {

        var $     = window.jQuery,
            data  = [{ name: 'hij1nx',  title: 'code exploder' },
                     { name: 'tmpvar', title: 'code pimp' }],
                    
            found = 0;

        window.weld($('.contact')[0], data, { 
          alias: { 
            name : function(parent, element, key, value) { 
              // Sanity
              test.ok(key === 'name');

              return $('.foo', element)[0];
            }
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
};