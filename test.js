

function parseConfig(config) {
  
  for(var o in config) {
    if (config[o].hasOwnProperty(o)) {

      if(config[o].file) {
        
      }
      
      if(config[o].data) {
        
      }
      
      if(config[o].selector) {
        
      }
      
      if(config[o].map) {
        
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

