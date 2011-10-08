
(function(){

  // Regular Expressions for parsing tags and attributes
  var startTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
    endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
    attr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
    
  // Empty Elements - HTML 4.01
  var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

  // Block Elements - HTML 4.01
  var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

  // Inline Elements - HTML 4.01
  var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

  // Elements that you can, intentionally, leave open
  // (and which close themselves)
  var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

  // Attributes that have their values filled in disabled="disabled"
  var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

  // Special Elements (can contain anything)
  var special = makeMap("script,style");

  var HTMLParser = this.HTMLParser = function(html, handler) {
    var index, chars, match, lastrest, lasttag, stack = [], last = html;
    stack.last = function(){
      return this[ this.length - 1 ];
    };

    while (html) {
      chars = true;

      // Make sure we're not in a script or style element
      if (!stack.last() || !special[ stack.last() ]) {

        // Comment
        if (html.indexOf('<!--') == 0) {
          index = html.indexOf('-->');
  
          if (index >= 0) {
            if (handler.comment)
              handler.comment(html.substring(4, index));
            html = html.substring(index + 3);
            chars = false;
          }
  
        // end tag
        } else if (html.indexOf('</') == 0) {
          match = html.match(endTag);
  
          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(endTag, parseEndTag);
            chars = false;
          }
  
        // start tag
        } else if (html.indexOf('<') == 0) {
          match = html.match(startTag);
  
          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(startTag, parseStartTag);
            chars = false;
          }
        }

        if (chars) {
          index = html.indexOf("<");

          var text = index < 0 ? html : html.substring(0, index);
          html = index < 0 ? '' : html.substring(index);

          if (handler.chars) {
            var attrs = [];
            parseAttrs(lastrest, attrs);
            handler.chars(lasttag, text, attrs);
          }
        }

      } else {
        html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){
          text = text.replace(/<!--(.*?)-->/g, "$1")
            .replace(/<!\[CDATA\[(.*?)]]>/g, "$1");

          if (handler.chars)
            var attrs = [];
            parseAttrs(lastrest, attrs);
            handler.chars(lasttag, text, attrs);

          return '';
        });

        parseEndTag('', stack.last());
      }

      if (html == last)
        throw 'Parse Error: ' + html;
      last = html;
    }
    
    // Clean up any remaining tags
    parseEndTag();

    function parseAttrs(rest, attrs) {
      return rest.replace(attr, function(match, name) {
        var value = arguments[2] ? arguments[2] :
          arguments[3] ? arguments[3] :
          arguments[4] ? arguments[4] :
          fillAttrs[name] ? name : "";

        attrs.push({
          name: name,
          value: name === 'class' ? value.split(/\s+/) : value,
          escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
        });
      });
    }

    function parseStartTag(tag, tagName, rest, unary) {
      
      lasttag = tagName;
      lastrest = rest;
      
      if (block[ tagName ]) {
        while (stack.last() && inline[ stack.last() ]) {
          parseEndTag("", stack.last());
        }
      }

      if (closeSelf[ tagName ] && stack.last() == tagName) {
        parseEndTag("", tagName);
      }

      unary = empty[ tagName ] || !!unary;

      if (!unary)
        stack.push(tagName);
      
      if (handler.start) {
        var attrs = [];
        parseAttrs(rest, attrs);

        if (handler.start)
          handler.start(tagName, attrs, unary);
      }
    }

    function parseEndTag(tag, tagName) {
      // If no tag name is provided, clean shop
      if (!tagName)
        var pos = 0;
        
      // Find the closest opened tag of the same type
      else
        for (var pos = stack.length - 1; pos >= 0; pos--)
          if (stack[ pos ] == tagName)
            break;
      
      if (pos >= 0) {
        // Close all the open elements, up the stack
        for (var i = stack.length - 1; i >= pos; i--)
          if (handler.end)
            handler.end(stack[ i ]);
        
        // Remove the open elements from the stack
        stack.length = pos;
      }
    }
  };

  function makeMap(str){
    var obj = {}, items = str.split(",");
    for (var i = 0; i < items.length; i++)
      obj[ items[i] ] = true;
    return obj;
  }
})();


var html = "";

function parse(html, data) {
  HTMLParser(html, {
    start: function(tag, attrs, unary) {
      results += "<" + tag;

      for (var i = 0; i < attrs.length; i++)
        results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';

      results += (unary ? "/" : "") + ">";
    },
    end: function(tag) {
      results += "</" + tag + ">";
    },
    chars: function(tag, text, attrs) {
      if(attrs) {
        var i=0, j=0, al=attrs.length, vl;
        //
        // if there is an array of attributes.
        //
        for (; i<al; i++) {
          console.log(attrs)
          //
          // if the attribute is a `class`.
          //
          if (attrs[i].name === 'class') {
            //
            // iterate over the class names in the class.
            //
            for (j=0, vl=attrs[i].value.length; j<vl; j++) {
              //
              // if there is a match.
              //
              if(data[attrs[i].value[j]]) {
                return results += data[attrs[i].value[j]];
              }
            }
          }
        }
      }
      return results += text;
    },
    comment: function(text) {
      results += "<!--" + text + "-->";
    }
  });
  return results;
};

var data = { 'test': 'Hello, World.' };
var html = '<p id="test" class="foo test"><i>world</i></p>'; 

console.log(parse(html, data));

