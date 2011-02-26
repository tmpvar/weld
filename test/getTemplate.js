window.suite.getTemplate = function(name, fn) {
  fn(window, $, $('#' + name)[0]);
};