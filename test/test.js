
var tests      = module.exports = {}
    ,assert     = require('assert')
    ,jsdom      = require('jsdom')
    ,fs         = require('fs')
    ,path       = require("path")
    ,jqpath     = path.join(__dirname, '..', 'demo', 'public', 'js', 'jquery.js')
    ,wpath      = path.join(__dirname, '..', 'lib', 'weld.js')
    ;

/*     ,html       = function(file, cb) {
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
*/


tests.template_singular_instance = function(t) {

  jsdom.env({

    scripts: [jqpath, wpath],
    html: path.join(__dirname, 'files', 'singular.html')

  }, 
  function(window) {

    var $ = window.jQuery;

    // some dummy data
    var data = {
      key   : 'someKey',
      value : 'someValue',
      icon  : '/path/to/image.png'
    };

    $('#singular').weld(data);
    
    t.ok($('.key').html() === data.key);
    t.ok($('.icon').attr('src') === data.icon);
    t.done();

  });

};

tests.template_alternate_insertion_with_bind = function(t) {
  
  jsdom.env({

    scripts: [jqpath, wpath],
    html: path.join(__dirname, 'files', 'contacts.html')

  },
  function(window) {
    
    var $ = window.jQuery;    

    var data = [{ name: 'hij1nx',  title: 'code exploder' },
                { name: 'tmpvar', title: 'code pimp' }];

    $('.contact').weld(data, { bind: { 'name': '.foo', 'title': '.title' } });
    t.ok($('.contact .foo:first').text().length > 1);
    t.done();
    
  });
  
};

tests.template_alternate_insertion_method = function(t) {
  
  jsdom.env({

    scripts: [jqpath, wpath],
    html: path.join(__dirname, 'files', 'contacts.html')

  },
  function(window) {
    
    var $ = window.jQuery;    

    var data = [{ name: 'hij1nx',  title : 'code exploder' },
                { name: 'tmpvar', title : 'code pimp' }];

    $('.contact').weld(data);
    $('.contact').weld(data, { method: "prepend" });
    
    t.ok($('.contact:first .name').text() == "tmpvar");
    t.done();
  });
  
};

tests.template_custom_insertion_method = function(t) {
  
  jsdom.env({

    scripts: [jqpath, wpath],
    html: path.join(__dirname, 'files', 'contacts.html')

  },
  function(window) {  
    
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

    t.ok($('.contact').length == 2);
    t.ok($('.contact:nth(0) .name').text() == "tmpvar");
    t.done();
    
  });

};

tests.template_append = function(t) {
  
  jsdom.env({

    scripts: [jqpath, wpath],
    html: path.join(__dirname, 'files', 'contacts.html')

  },
  function(window) {  
    
    var $ = window.jQuery;    

    var data = [{ name: 'hij1nx',  title : 'manhatton' },
                { name: 'tmpvar', title : 'brooklyn' }];

    $('.contact').weld(data);
    $('.contact').weld(data);

    t.ok($('.contact .name').length > 2);
    t.done();
  });
};


tests.template_array_of_instances = function(t) {

  jsdom.env({

    scripts: [jqpath, wpath],
    html: path.join(__dirname, 'files', 'contacts.html')

  },
  function(window) {  
    
    var $ = window.jQuery;    

    var data = [{ name: 'hij1nx',  title : 'code exploder' },
                { name: 'tmpvar', title : 'code wrangler' }];

    $('.contact').weld(data);
    
    t.ok($('.name:first').html() === data[0].name);
    t.done();
    
  });
  
};

tests.template_nested_objects = function(t) {
  
  jsdom.env({

    scripts: [jqpath, wpath],
    html: path.join(__dirname, 'files', 'array-of-arrays.html')

  },
  function(window) {  
    
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

    t.ok($('.person').length === 2);

    //  Every node that gets iterated over should have a pre-processed class
    // (7 in total)

    t.ok($('.pre-processed').length === 7);
    t.done();
  });

};

tests.template_form_elements = function(t) {

  jsdom.env({

    scripts: [jqpath, wpath],
    html: path.join(__dirname, 'files', 'form.html')

  },
  function(window) {
    
    var $ = window.jQuery;    

    var data = {
      'email' : 'tmpvar@gmail.com'
    }

    $('form').weld(data);

    t.ok($(':input[name=email]').val() === data.email);
    t.done();

  });

};
