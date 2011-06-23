;(function(exports) {

  var getTemplate = require('./getTemplate');

  exports.suite = {
    "Test 1: Sanity" : function(test) {
      getTemplate('null', function(window, weld, $) {
        var template = $("<div><a class='link'></a></div>")[0];

        weld(template, { link : "text" }, {
          set : function(parent, element, key, value) {
            $(element).text("woo");
          }
        });

        test.ok($('a', template).text() === "woo");
        test.done();
      });
    },

    "Test 2: Assign data to elements using an object literal that has one level of depth": function(test) {
      getTemplate('singular', function(window, weld, $, template) {
        var data = {
          key   : 'someKey',
          value : 'someValue',
          icon  : '/path/to/image.png'
        };

        weld(template, data);

        test.ok($('.key', template).text() === data.key);
        test.ok($('.icon', template).attr('src') === data.icon);
        test.ok($(':input[name="value"]', template).val() === data.value);
        test.done();
      
      });
    
    },
  
    "Test 3: Generate markup based on an element using the alias parameter to explicitly correlate data-keys and elements": function(test) {
    
      getTemplate('contacts-alias', function(window, weld, $, template) {

        var data = [{ name: 'hij1nx',  title: 'code exploder' },
                    { name: 'tmpvar', title: 'code pimp' }];

        weld($('.contact', template)[0], data, { 
          alias: { 
            'name': 'foo', 
            'title': 'title' 
          }
        });

        test.ok($('.contact', template).length === 2);

        test.ok($('.contact:nth(0) .foo', template).text() == "hij1nx");
        test.ok($('.contact:nth(1) .foo', template).text() == "tmpvar");

        test.ok($('.contact:nth(0) .title', template).text() == "code exploder");
        test.ok($('.contact:nth(1) .title', template).text() == "code pimp");

        test.done();

      });

    },
  
    "Test 4: Generate markup based on an element using an (alias w/function) parameter to explicitly correlate data and elements": function(test) {
      getTemplate('contacts-alias', function(window, weld, $, template) {

        var data = [{ name: 'hij1nx',  title: 'code exploder' },
                    { name: 'tmpvar', title: 'code pimp' }];

        weld($('.contact', template)[0], data, { 
          alias: { 
            'name' : function(parent, element, key, value) { 
              // Sanity
              test.ok(key === 'name');

              return 'foo';
            },
            'title': 'title'
          }
        });

        test.ok($('.contact', template).length === 2);

        test.ok($('.contact:nth(0) .foo', template).text() == "hij1nx");
        test.ok($('.contact:nth(1) .foo', template).text() == "tmpvar");

        test.ok($('.contact:nth(0) .title', template).text() == "code exploder");
        test.ok($('.contact:nth(1) .title', template).text() == "code pimp");

        test.done();

      });

    },  
  
    "Test 5: Generate markup from an element with an alternate method of insertion": function(test) {
      getTemplate('contacts', function(window, weld, $, template) {
        var
        data  = [{ name: 'hij1nx',  title: 'code exploder' },
                 { name: 'tmpvar', title: 'code pimp' }],
        times = 0;

        weld($('.contact', template)[0], data, {
           insert: function(parent, element) {
             times++;
             parent.insertBefore(element, parent.firstChild);
           }
        });

        test.ok($('.contact', template).length === 2);

        test.ok($('.contact:nth(0) .name', template).text() == "tmpvar");
        test.ok($('.contact:nth(1) .name', template).text() == "hij1nx");

        test.ok($('.contact:nth(0) .title', template).text() == "code pimp");
        test.ok($('.contact:nth(1) .title', template).text() == "code exploder");
      
        test.ok(times === 2);
        test.done();
      });

    },

    "Test 6: Append to a node that has already been the subject of a weld": function(test) {
      getTemplate('contacts', function(window, weld, $, container) {
        var
        data     = [{ name: 'hij1nx',  title : 'manhatton' },
                    { name: 'tmpvar', title : 'brooklyn' }],
        template = $('.contact', container)[0];

        weld(template, data);
        weld(template, data);

        test.ok($('.contact:nth(0) .name', container).text() === "hij1nx");
        test.ok($('.contact:nth(1) .name', container).text() === "tmpvar");
        test.ok($('.contact:nth(2) .name', container).text() === "hij1nx");
        test.ok($('.contact:nth(3) .name', container).text() === "tmpvar");

        test.ok($('.contact:nth(0) .title', container).text() === "manhatton");
        test.ok($('.contact:nth(1) .title', container).text() === "brooklyn");
        test.ok($('.contact:nth(2) .title', container).text() === "manhatton");
        test.ok($('.contact:nth(3) .title', container).text() === "brooklyn");
        test.ok($('.contact', container).length == 4);
        test.ok($('.contact .name', container).length == 4);
        test.ok($('.contact .title', container).length == 4);

        test.done();
      });
  
    },
  
    "Test 7: Create markup from an array of objects that have one dimention": function(test) {
      getTemplate('contacts', function(window, weld, $, template) {
        var data = [{ name: 'hij1nx',  title : 'code exploder' },
                    { name: 'tmpvar', title : 'code wrangler' }];

        weld($('.contact', template)[0], data);
        test.ok($('.contact', template).length === 2);

        test.ok($('.contact:nth(0) .name', template).text() == "hij1nx");
        test.ok($('.contact:nth(1) .name', template).text() == "tmpvar");

        test.ok($('.contact:nth(0) .title', template).text() == "code exploder");
        test.ok($('.contact:nth(1) .title', template).text() == "code wrangler");
        test.done();
    
      });

    },
  
    "Test 8: Try to pair data with selectors that yield no matching elements": function(test) {

      getTemplate('contacts-none', function(window, weld, $, container) {
        
        var data = [{ x01h: 'hij1nx',  x0x1h: 'code exploder' },
                    { name: 'tmpvar', x0x1h: 'code wrangler' }];

        weld($('.contact', container)[0], data);
        
        test.ok($('.name:nth(1)', container).text().indexOf('tmpvar') > -1);
        test.ok($('.title:nth(1)', container).text().indexOf('Leet Developer') > -1);

        test.ok($('.contact', container).length === 2);



        test.done();

      });

    },

    "Test 9: Create markup from an object literal that has one dimention that contains are array of objects with one dimention": function(test) {
      getTemplate('array-of-arrays', function(window, weld, $) {

        // TODO: remove siblings who match .person
        // it is impossible to do explicit maching (even/odd)
      
        // SIDECASE FIX0r
        //         - when matching arrays
        //         - capture the className
        //         - compare with siblings[*].className (be aware of ordering!)
        //         - remove COMPLETE matches
        //     
        
        weld($('.people')[0], {
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
          map: function(parent, element, key, value) {
            $(element).addClass('pre-processed');
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
      
        test.ok($('.pre-processed').length === 8);
        test.done();

      });

    },
   
   "Test 10: Create markup using form elements as the template": function(test) {
      getTemplate('form', function(window, weld, $) {

        var data = {
          'email' : 'tmpvar@gmail.com'
        };

        weld($('form')[0], data);

        test.ok($(':input[name=email]').val() === data.email);
        test.done();

      });
    },
    "Test 11: Returning false from map stops the current branch from being visited" : function(test) {
      getTemplate('null', function(window, weld, $) {

        var template = $('<ul class="list"><li class="item">hello <span class="where">do not touch</span></li></ul>');
        $('#temp').append(template);

        weld($(template)[0], [
          { where : 'world' }
        ], {
          map : function(element, k, v) {
            return false;
          }
        });

        test.ok($('.where', $(template)[0]).text() === 'do not touch');
        test.done();

      });
    },
    "Test 12: Use a NodeList from another document and weld it into the target document" : function(test) {
      getTemplate('source-and-dest #data', function(swindow, sweld, s$, sourceTemplate) {
        getTemplate('source-and-dest #dest', function(window, weld, $, template) {
          var impl           = window.document.implementation,
              doctype        = impl.createDocumentType("html", "html", "html"),
              sourceDoc      = impl.createDocument(null, "sourceDoc", doctype),
              importedSource = sourceDoc.importNode(sourceTemplate, true);
              sources = importedSource.getElementsByTagName("span");

          test.ok(importedSource.ownerDocument !== window.document);

          weld($('li.number', template)[0], sources);

          test.ok($('li.number', template).length === 3);
          test.ok($('li.number:nth(0) span', template).text() === "zero");
          test.ok($('li.number:nth(1) span', template).text() === "one");
          test.ok($('li.number:nth(2) span', template).text() === "two");
          test.ok($('li.number', template).text() === "zeroonetwo");
          test.done();
        })
      });
    },

    "Test 13: Use a NodeList from the current document and weld it to another area in the same document" : function(test) {
      getTemplate('source-and-dest', function(window, weld, $, container) {
        var sources = $("#data span", container);

        weld($('li.number', container)[0], sources);

        test.ok($('li.number', container).length === 3);
        test.ok($('li.number:nth(0) span', container).text() === "zero");
        test.ok($('li.number:nth(1) span', container).text() === "one");
        test.ok($('li.number:nth(2) span', container).text() === "two");
        test.ok($('li.number', container).text() === "zeroonetwo");
        test.done();
      });
    },

    "Test 14: Alias may return a dom element which is used instead of doing an explicit match": function(test) {

      getTemplate('contacts-alias-opt-out', function(window, weld, $, container) {

        var $     = window.jQuery,
            data  = [{ name: 'hij1nx',  title: 'code exploder' },
                     { name: 'tmpvar', title: 'code pimp' }],
            found = 0;

        weld($('.contact', container)[0], data, { 
          alias: { 
            name : function(parent, element, key, value) { 
              // Sanity
              test.ok(key === 'name');

              return $('.foo', element)[0];
            }
          }
        });

        test.ok($('.contact', container).length === 2);

        test.ok($('.contact:nth(0) .foo', container).text() == "hij1nx");
        test.ok($('.contact:nth(1) .foo', container).text() == "tmpvar");

        test.ok($('.contact:nth(0) .title', container).text() == "code exploder");
        test.ok($('.contact:nth(1) .title', container).text() == "code pimp");

        test.done();
      });
    },
  
    "Test 15: Alias may opt out of rendering a data-key/element match because of a false value": function(test) {

      getTemplate('contacts-opt-out', function(window, weld, $, container) {

        var $     = window.jQuery,
            data  = [{ name: 'hij1nx',  title: 'code exploder' },
                     { name: 'tmpvar', title: 'code pimp' }],
            found = 0;

        weld($('.contact', container)[0], data, { 
          alias: { 
            name : false
          }
        });

        test.ok($('.contact', container).length === 2);

        test.ok($('.contact:nth(0) .foo', container).text() == "My Name");
        test.ok($('.contact:nth(1) .foo', container).text() == "My Name");

        test.done();
      });
    },
    "Test 16: Assign values other than strings": function(test) {

      getTemplate('alternate-values', function(window, weld, $, container) {

        var $     = window.jQuery,
            data  = { name: 'bo diddly',  age: 10000, awesome: true };

        weld($('.contact', container)[0], data);
        test.ok($('.contact .age', container).text() === '10000');
        test.done();
      });
    }    
    
  };
}((typeof module === "undefined") ? window : module.exports));
