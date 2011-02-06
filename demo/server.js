
var sys = require('sys'),
    fs = require('fs'),
    http = require('http'),
    url = require('url'),
    static = require('node-static'),
    weld = require('../../lib/weld').weld,
    journey = require('journey');

(function (port) {

  var router
      ,server
      ,files = new (static.Server)('./public')
      ctypes = {
        json: { 'Content-Type': 'application/json' },
        html: { 'Content-Type': 'text/html' }
      };
        
  router = function () {

    return new (journey.Router)(function (map) {

      map.root.bind(function (response) { 
        response.send(200, ctypes.json, { message: 'No resource.' }); 
      });

      map.path('/api', function () { // some fake data base calls...

        this.get('search').bind(function (response, data) {
          fs.readFile('./data/foo.json', function (err, file) {
            response.send(200, ctypes.json, file.toString());
          });
        });

        this.post('search').bind(function (response, data) {
          fs.readFile('./data/bar.json', function (err, file) {
            response.send(200, ctypes.json, file.toString());
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
      if (uri.pathname.slice(1).split('/')[0] !== 'api') {
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
