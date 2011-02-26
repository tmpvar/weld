var jsdom    =   require('jsdom')
    ,path     =   require("path")
    ,jqpath   =   path.join(__dirname, 'vendor', 'jquery.js')
    ,wpath      = require('weld').filepath;

module.exports = function (name, fn) {
    jsdom.env(path.join(__dirname, 'test.html'), [jqpath, wpath], function(errors, window) {
      module.exports = function(name, fn) {
        fn(window, window.$, window.$('#' + name)[0]);
      };
      module.exports(name, fn);
    });
};
