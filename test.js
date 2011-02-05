

function parseConfig(config) {
  
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
  
}


parseConfig({

  ".name[foo]": { data: { "foo": "bla" } },
  ".foo": { file: "/foo.html" },
  ".bazz": {
    data: d.foo,
    map: function(node, data) {
      
      node.innerHTML = data.foo;
      return node;
    }
  },
  "#bar": { selector: "#bla" }

});

