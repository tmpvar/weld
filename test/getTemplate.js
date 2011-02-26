var jsdom    =   require('jsdom')
    ,path     =   require("path")
    ,jqpath   =   path.join(__dirname, 'vendor', 'jquery.js')
    ,wpath      = require('weld').filepath;

module.exports = function (name, fn) {
    jsdom.env(path.join(__dirname, 'test.html'), [jqpath, wpath], function(errors, window) {
      module.exports = function(name, fn) {
        var template = window.$('#' + name)[0];
        if (template) {
          template = template.parentNode.cloneNode(true)
        }
        fn(window, window.weld, window.$, template);
      };
      module.exports(name, fn);
    });
};
