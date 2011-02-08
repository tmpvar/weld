
var sys = require('sys'),
    fs = require('fs'),
    http = require('http'),
    url = require('url'),
    static = require('node-static'),
    weld = require('../../lib/weld').weld,
    journey = require('journey'),
    jsdom      = require('jsdom'),
    fs         = require('fs'),
    html       = function(file, cb) {
      file = __dirname + '/files/' + file;
      fs.readFile(file, function(err, data) {
        if (err) {
          return cb(err);
        }

        var window = jsdom.html(data.toString()).createWindow();
        jsdom.jQueryify(window, __dirname + '/../lib/jquery.js', function() {
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
      })
    };

(function (port) {

  var router
      ,server
      ,files = new (static.Server)('./public')
      ctypes = {
        json: { 'Content-Type': 'application/json' },
        html: { 'Content-Type': 'text/html' }
      },
      data: {
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
      };
        
  router = function () {

    return new (journey.Router)(function (map) {

      map.root.bind(function (response) { 
        response.send(200, ctypes.json, { message: 'No resource.' }); 
      });

      map.path('/people', function () { // some fake data base calls...

        this.get('all').bind(function (response) {
          
          html('people.html', function(err, weld, $, window) {
          
            response.send(200, ctypes.json, $('.people').weld(data));
          });
          
        });

        this.get('first').bind(function (response) {
          
          html('person.html', function(err, weld, $, window) {
          
            response.send(200, ctypes.json, $('.feature').weld(data.person[0]));
          });
          
        });

      });
    });
  };
  
  server = http.createServer(function (req, res) {

    var body = '';

    // Append the chunk to body
    req.addListener('data', function (chunk) { 
      body += chunk; 
    });

    req.addListener('end', function () {
      var uri = url.parse(req.url);
      if (uri.pathname.slice(1).split('/')[0] !== 'people') {
        sys.puts(uri.pathname)
        files.serve(req, res);
      }
      else {
        router.route(req, body, function (result) {
          res.writeHead(result.status, result.headers);
          res.end(result.body);
        });
      }
    });
  });

  if (port) server.listen(port);
  console.log("Demo is running on port "+port);
  
})(8124);
