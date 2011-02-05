


{
  ".name[foo]": { "foo": "bla" },
  ".foo": "/foo.html",
  ".bazz": {
    data: d.foo,
    map: function(node, data) {
      
      node.innerHTML = data.foo;
      return node;
    }
  },
  "#bar": { "/bar.html": "bar.json" }
}

