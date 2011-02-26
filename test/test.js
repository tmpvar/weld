var jsdom    =   require('jsdom')
    ,path     =   require("path")
    ,jqpath   =   path.join(__dirname, 'vendor', 'jquery.js')
    ,wpath      = require('weld').filepath
    ,suites   =   require(__dirname + "/suite")
    ,TestCase = require('nodeunit').testCase;

suites.suite.setUp = function(cb) {
  this.hello = "world"
  if (!suites.suite.getTemplate) {

    jsdom.env(path.join(__dirname, 'test.html'), [jqpath, wpath], function(errors, window) {
      suites.suite.getTemplate = function(name, fn) {
        fn(window, window.$, window.$('#' + name)[0]);
      };
      cb();
    });
  } else {
    cb()
  }
};

module.exports = TestCase(suites.suite);
