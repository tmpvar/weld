
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

