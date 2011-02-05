
var sys = require('sys')
    ,fs = require('fs')
    ;
    
this.weld = function(config) {
  
  for(var o in config) {

    if (config[o].hasOwnProperty(o)) {

      var collection = $(o);

      if(config[o].file) {
        
      }
      else if(config[o].selector) {
        
      }
      else if(config[o].map) {
        
      }
    
      if(config[o].data) {
        
      }         

    }
  }

  return this;
  
};