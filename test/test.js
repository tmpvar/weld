
var tests      = module.exports = {}
    ,assert     = require('assert')
    ,jsdom      = require('jsdom')
    ,fs         = require('fs')
    ,html       = function(file, cb) {
      file = __dirname + '/files/' + file;
      fs.readFile(file, function(err, data) {
        if (err) {
          return cb(err);
        }

        var window = jsdom.html(data.toString()).createWindow();
        jsdom.jQueryify(window, __dirname + '/../demo/public/js/jquery.js', function() {
          // remove the jQuery script tag
          window.$('script:last').remove();

          // TODO: this is nasty, but quick.
          var weldTag = window.document.createElement('script');

          weldTag.src = 'file://' + __dirname + '/../lib/weld.js';
          weldTag.onload = function() {
            // remove the weld scripttag
            window.$('script:last').remove();
            cb(null, window.weld, window.$, window);
          };
          window.document.body.appendChild(weldTag);
        });
      });
    };

tests.template_singular_instance = function(t) {
  html('singular.html', function(err, weld, $, window) {

     // some dummy data
    var data = {
      key   : 'someKey',
      value : 'someValue',
      icon  : '/path/to/image.png'
    };

    weld('#singular', data);
    t.ok($('.key').html() === data.key);
    t.ok($('.icon').attr('src') === data.icon);
    t.done();
  });
};

tests.template_alternate_insertion_with_bind = function(t) {
  html('contacts.html', function(err, weld, $, window) {

    var data = [{ name: 'Paulo',  title: 'code exploder' },
                { name: 'Elijah', title: 'code pimp' }];

    weld('.contact', data, { bind: { 'name': '.foo', 'title': '.title' } });
    t.ok($('.contact .foo:first').text().length > 1);
    t.done();
  });
};

tests.template_alternate_insertion_method = function(t) {
  html('contacts.html', function(err, weld, $, window) {

    var data = [{ name: 'Paulo',  title : 'code exploder' },
                { name: 'Elijah', title : 'code pimp' }];

    weld('.contact', data);
    weld('.contact', data, { method: "prepend" });
    t.ok($('.contact:first .name').text() == "Elijah");
    t.done();
  });
};

tests.template_custom_insertion_method = function(t) {
  html('contacts.html', function(err, weld, $, window) {

    var data = [{ name: 'Paulo',  title : 'code master' },
                { name: 'Elijah', title : 'code pimp' }];

var times = 1;
    weld('.contact', data, {
     method: function(parent, newElement) {
     times++;
       parent.prepend(newElement);
     }
    });

    t.ok($('.contact').length == 2);
    t.ok($('.contact:nth(0) .name').text() == "Elijah");
    t.done();
  });
};

tests.template_append = function(t) {
  html('contacts.html', function(err, weld, $, window) {

    var data = [{ name: 'Paulo',  title : 'code master' },
                { name: 'Elijah', title : 'code pimp' }];

    weld('.contact', data);
    weld('.contact', data);

    t.ok($('.contact .name').length > 2);
    t.done();
  });
};


tests.template_array_of_instances = function(t) {
  html('contacts.html', function(err, weld, $, window) {

    var data = [{ name: 'Paulo',  title : 'code exploder' },
                { name: 'Elijah', title : 'code pimp' }];

    weld('.contact', data);
    t.ok($('.name:first').html() === data[0].name);
    t.done();
  });
};

tests.template_nested_objects = function(t) {
  html('array-of-arrays.html', function(err, weld, $, window) {
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

    t.ok($('.person').length === 2);

    //  Every node that gets iterated over should have a pre-processed class
    // (7 in total)

    t.ok($('.pre-processed').length === 7);
    t.done();
  });
};

tests.template_form_elements = function(t) {
  html('form.html', function(err, weld, $, window) {
    var data = {
      'email' : 'tmpvar@gmail.com'
    }

    $('form').weld(data);

    t.ok($(':input[name=email]').val() === data.email);
    t.done();

  });
};
