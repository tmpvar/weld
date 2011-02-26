
var sys = require('sys'),
    http = require('http'),
    url = require('url'),
    journey = require('journey'),
    static = require('node-static'),

    wpath = require('weld').filepath,
    jsdom = require('jsdom');

(function (port) {

  var router,
      server,
      files = new (static.Server)('./public'),
      data = {
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
          
          jsdom.env({

            scripts: [jqpath, wpath],
            html: path.join(__dirname, 'files', 'singular.html')

          }, 
          function(errors, window) {

            var $ = window.jQuery;
            window.weld($('#singular')[0], data);

          });
          
        });

        this.get('first').bind(function (response) {
          
          jsdom.env({

            scripts: [jqpath, wpath],
            html: path.join(__dirname, 'files', 'singular.html')

          }, 
          function(errors, window) {

            var $ = window.jQuery;
            window.weld($('#singular')[0], data);

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
        router().handle(req, body, function (result) {
          res.writeHead(result.status, result.headers);
          res.end(result.body);
        });
      }
    });
  });

  if (port) server.listen(port);
  console.log("Demo is running on port "+port);
  
})(8124);
