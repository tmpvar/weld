
!function () {

  CodeMirror.defineMode("xml", function(config, parserConfig) {
    var indentUnit = config.indentUnit;
    var Kludges = parserConfig.htmlMode ? {
      autoSelfClosers: {"br": true, "img": true, "hr": true, "link": true, "input": true,
                        "meta": true, "col": true, "frame": true, "base": true, "area": true},
      doNotIndent: {"pre": true, "!cdata": true},
      allowUnquoted: true
    } : {autoSelfClosers: {}, doNotIndent: {"!cdata": true}, allowUnquoted: false};
    var alignCDATA = parserConfig.alignCDATA;

    // Return variables for tokenizers
    var tagName, type;

    function inText(stream, state) {
      function chain(parser) {
        state.tokenize = parser;
        return parser(stream, state);
      }

      var ch = stream.next();
      if (ch == "<") {
        if (stream.eat("!")) {
          if (stream.eat("[")) {
            if (stream.match("CDATA[")) return chain(inBlock("atom", "]]>"));
            else return null;
          }
          else if (stream.match("--")) return chain(inBlock("comment", "-->"));
          else if (stream.match("DOCTYPE")) {
            stream.eatWhile(/[\w\._\-]/);
            return chain(inBlock("meta", ">"));
          }
          else return null;
        }
        else if (stream.eat("?")) {
          stream.eatWhile(/[\w\._\-]/);
          state.tokenize = inBlock("meta", "?>");
          return "meta";
        }
        else {
          type = stream.eat("/") ? "closeTag" : "openTag";
          stream.eatSpace();
          tagName = "";
          var c;
          while ((c = stream.eat(/[^\s\u00a0=<>\"\'\/?]/))) tagName += c;
          state.tokenize = inTag;
          return "tag";
        }
      }
      else if (ch == "&") {
        stream.eatWhile(/[^;]/);
        stream.eat(";");
        return "atom";
      }
      else {
        stream.eatWhile(/[^&<]/);
        return null;
      }
    }

    function inTag(stream, state) {
      var ch = stream.next();
      if (ch == ">" || (ch == "/" && stream.eat(">"))) {
        state.tokenize = inText;
        type = ch == ">" ? "endTag" : "selfcloseTag";
        return "tag";
      }
      else if (ch == "=") {
        type = "equals";
        return null;
      }
      else if (/[\'\"]/.test(ch)) {
        state.tokenize = inAttribute(ch);
        return state.tokenize(stream, state);
      }
      else {
        stream.eatWhile(/[^\s\u00a0=<>\"\'\/?]/);
        return "word";
      }
    }

    function inAttribute(quote) {
      return function(stream, state) {
        while (!stream.eol()) {
          if (stream.next() == quote) {
            state.tokenize = inTag;
            break;
          }
        }
        return "string";
      };
    }

    function inBlock(style, terminator) {
      return function(stream, state) {
        while (!stream.eol()) {
          if (stream.match(terminator)) {
            state.tokenize = inText;
            break;
          }
          stream.next();
        }
        return style;
      };
    }

    var curState, setStyle;
    function pass() {
      for (var i = arguments.length - 1; i >= 0; i--) curState.cc.push(arguments[i]);
    }
    function cont() {
      pass.apply(null, arguments);
      return true;
    }

    function pushContext(tagName, startOfLine) {
      var noIndent = Kludges.doNotIndent.hasOwnProperty(tagName) || (curState.context && curState.context.noIndent);
      curState.context = {
        prev: curState.context,
        tagName: tagName,
        indent: curState.indented,
        startOfLine: startOfLine,
        noIndent: noIndent
      };
    }
    function popContext() {
      if (curState.context) curState.context = curState.context.prev;
    }

    function element(type) {
      if (type == "openTag") {curState.tagName = tagName; return cont(attributes, endtag(curState.startOfLine));}
      else if (type == "closeTag") {
        var err = false;
        if (curState.context) {
          err = curState.context.tagName != tagName;
          popContext();
        } else {
          err = true;
        }
        if (err) setStyle = "error";
        return cont(endclosetag(err));
      }
      else if (type == "string") {
        if (!curState.context || curState.context.name != "!cdata") pushContext("!cdata");
        if (curState.tokenize == inText) popContext();
        return cont();
      }
      else return cont();
    }
    function endtag(startOfLine) {
      return function(type) {
        if (type == "selfcloseTag" ||
            (type == "endTag" && Kludges.autoSelfClosers.hasOwnProperty(curState.tagName.toLowerCase())))
          return cont();
        if (type == "endTag") {pushContext(curState.tagName, startOfLine); return cont();}
        return cont();
      };
    }
    function endclosetag(err) {
      return function(type) {
        if (err) setStyle = "error";
        if (type == "endTag") return cont();
        return pass();
      }
    }

    function attributes(type) {
      if (type == "word") {setStyle = "attribute"; return cont(attributes);}
      if (type == "equals") return cont(attvalue, attributes);
      return pass();
    }
    function attvalue(type) {
      if (type == "word" && Kludges.allowUnquoted) {setStyle = "string"; return cont();}
      if (type == "string") return cont();
      return pass();
    }

    return {
      startState: function() {
        return {tokenize: inText, cc: [], indented: 0, startOfLine: true, tagName: null, context: null};
      },

      token: function(stream, state) {
        if (stream.sol()) {
          state.startOfLine = true;
          state.indented = stream.indentation();
        }
        if (stream.eatSpace()) return null;

        setStyle = type = tagName = null;
        var style = state.tokenize(stream, state);
        if ((style || type) && style != "xml-comment") {
          curState = state;
          while (true) {
            var comb = state.cc.pop() || element;
            if (comb(type || style)) break;
          }
        }
        state.startOfLine = false;
        return setStyle || style;
      },

      indent: function(state, textAfter) {
        var context = state.context;
        if (context && context.noIndent) return 0;
        if (alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
        if (context && /^<\//.test(textAfter))
          context = context.prev;
        while (context && !context.startOfLine)
          context = context.prev;
        if (context) return context.indent + indentUnit;
        else return 0;
      },

      compareStates: function(a, b) {
        if (a.indented != b.indented || a.tagName != b.tagName) return false;
        for (var ca = a.context, cb = b.context; ; ca = ca.prev, cb = cb.prev) {
          if (!ca || !cb) return ca == cb;
          if (ca.tagName != cb.tagName) return false;
        }
      },

      electricChars: "/"
    };
  });

  // CodeMirror.defineMIME("application/xml", "xml");
  // CodeMirror.defineMIME("text/html", {name: "xml", htmlMode: true});

  CodeMirror.defineMode("javascript", function(config, parserConfig) {
    var indentUnit = config.indentUnit;
    var jsonMode = parserConfig.json;

    // Tokenizer

    var keywords = function(){
      function kw(type) {return {type: type, style: "keyword"};}
      var A = kw("keyword a"), B = kw("keyword b"), C = kw("keyword c");
      var operator = kw("operator"), atom = {type: "atom", style: "atom"};
      return {
        "if": A, "while": A, "with": A, "else": B, "do": B, "try": B, "finally": B,
        "return": C, "break": C, "continue": C, "new": C, "delete": C, "throw": C,
        "var": kw("var"), "function": kw("function"), "catch": kw("catch"),
        "for": kw("for"), "switch": kw("switch"), "case": kw("case"), "default": kw("default"),
        "in": operator, "typeof": operator, "instanceof": operator,
        "true": atom, "false": atom, "null": atom, "undefined": atom, "NaN": atom, "Infinity": atom
      };
    }();

    var isOperatorChar = /[+\-*&%=<>!?|]/;

    function chain(stream, state, f) {
      state.tokenize = f;
      return f(stream, state);
    }

    function nextUntilUnescaped(stream, end) {
      var escaped = false, next;
      while ((next = stream.next()) != null) {
        if (next == end && !escaped)
          return false;
        escaped = !escaped && next == "\\";
      }
      return escaped;
    }

    // Used as scratch variables to communicate multiple values without
    // consing up tons of objects.
    var type, content;
    function ret(tp, style, cont) {
      type = tp; content = cont;
      return style;
    }

    function jsTokenBase(stream, state) {
      var ch = stream.next();
      if (ch == '"' || ch == "'")
        return chain(stream, state, jsTokenString(ch));
      else if (/[\[\]{}\(\),;\:\.]/.test(ch))
        return ret(ch);
      else if (ch == "0" && stream.eat(/x/i)) {
        stream.eatWhile(/[\da-f]/i);
        return ret("number", "atom");
      }      
      else if (/\d/.test(ch)) {
        stream.match(/^\d*(?:\.\d*)?(?:e[+\-]?\d+)?/);
        return ret("number", "atom");
      }
      else if (ch == "/") {
        if (stream.eat("*")) {
          return chain(stream, state, jsTokenComment);
        }
        else if (stream.eat("/")) {
          stream.skipToEnd();
          return ret("comment", "comment");
        }
        else if (state.reAllowed) {
          nextUntilUnescaped(stream, "/");
          stream.eatWhile(/[gimy]/); // 'y' is "sticky" option in Mozilla
          return ret("regexp", "string");
        }
        else {
          stream.eatWhile(isOperatorChar);
          return ret("operator", null, stream.current());
        }
      }
      else if (isOperatorChar.test(ch)) {
        stream.eatWhile(isOperatorChar);
        return ret("operator", null, stream.current());
      }
      else {
        stream.eatWhile(/[\w\$_]/);
        var word = stream.current(), known = keywords.propertyIsEnumerable(word) && keywords[word];
        return known ? ret(known.type, known.style, word) :
                       ret("variable", "variable", word);
      }
    }

    function jsTokenString(quote) {
      return function(stream, state) {
        if (!nextUntilUnescaped(stream, quote))
          state.tokenize = jsTokenBase;
        return ret("string", "string");
      };
    }

    function jsTokenComment(stream, state) {
      var maybeEnd = false, ch;
      while (ch = stream.next()) {
        if (ch == "/" && maybeEnd) {
          state.tokenize = jsTokenBase;
          break;
        }
        maybeEnd = (ch == "*");
      }
      return ret("comment", "comment");
    }

    // Parser

    var atomicTypes = {"atom": true, "number": true, "variable": true, "string": true, "regexp": true};

    function JSLexical(indented, column, type, align, prev, info) {
      this.indented = indented;
      this.column = column;
      this.type = type;
      this.prev = prev;
      this.info = info;
      if (align != null) this.align = align;
    }

    function inScope(state, varname) {
      for (var v = state.localVars; v; v = v.next)
        if (v.name == varname) return true;
    }

    function parseJS(state, style, type, content, stream) {
      var cc = state.cc;
      // Communicate our context to the combinators.
      // (Less wasteful than consing up a hundred closures on every call.)
      cx.state = state; cx.stream = stream; cx.marked = null, cx.cc = cc;

      if (!state.lexical.hasOwnProperty("align"))
        state.lexical.align = true;

      while(true) {
        var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;
        if (combinator(type, content)) {
          while(cc.length && cc[cc.length - 1].lex)
            cc.pop()();
          if (cx.marked) return cx.marked;
          if (type == "variable" && inScope(state, content)) return "variable-2";
          return style;
        }
      }
    }

    // Combinator utils

    var cx = {state: null, column: null, marked: null, cc: null};
    function pass() {
      for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i]);
    }
    function cont() {
      pass.apply(null, arguments);
      return true;
    }
    function register(varname) {
      var state = cx.state;
      if (state.context) {
        cx.marked = "def";
        for (var v = state.localVars; v; v = v.next)
          if (v.name == varname) return;
        state.localVars = {name: varname, next: state.localVars};
      }
    }

    // Combinators

    var defaultVars = {name: "this", next: {name: "arguments"}};
    function pushcontext() {
      if (!cx.state.context) cx.state.localVars = defaultVars;
      cx.state.context = {prev: cx.state.context, vars: cx.state.localVars};
    }
    function popcontext() {
      cx.state.localVars = cx.state.context.vars;
      cx.state.context = cx.state.context.prev;
    }
    function pushlex(type, info) {
      var result = function() {
        var state = cx.state;
        state.lexical = new JSLexical(state.indented, cx.stream.column(), type, null, state.lexical, info)
      };
      result.lex = true;
      return result;
    }
    function poplex() {
      var state = cx.state;
      if (state.lexical.prev) {
        if (state.lexical.type == ")")
          state.indented = state.lexical.indented;
        state.lexical = state.lexical.prev;
      }
    }
    poplex.lex = true;

    function expect(wanted) {
      return function expecting(type) {
        if (type == wanted) return cont();
        else if (wanted == ";") return pass();
        else return cont(arguments.callee);
      };
    }

    function statement(type) {
      if (type == "var") return cont(pushlex("vardef"), vardef1, expect(";"), poplex);
      if (type == "keyword a") return cont(pushlex("form"), expression, statement, poplex);
      if (type == "keyword b") return cont(pushlex("form"), statement, poplex);
      if (type == "{") return cont(pushlex("}"), block, poplex);
      if (type == ";") return cont();
      if (type == "function") return cont(functiondef);
      if (type == "for") return cont(pushlex("form"), expect("("), pushlex(")"), forspec1, expect(")"),
                                        poplex, statement, poplex);
      if (type == "variable") return cont(pushlex("stat"), maybelabel);
      if (type == "switch") return cont(pushlex("form"), expression, pushlex("}", "switch"), expect("{"),
                                           block, poplex, poplex);
      if (type == "case") return cont(expression, expect(":"));
      if (type == "default") return cont(expect(":"));
      if (type == "catch") return cont(pushlex("form"), pushcontext, expect("("), funarg, expect(")"),
                                          statement, poplex, popcontext);
      return pass(pushlex("stat"), expression, expect(";"), poplex);
    }
    function expression(type) {
      if (atomicTypes.hasOwnProperty(type)) return cont(maybeoperator);
      if (type == "function") return cont(functiondef);
      if (type == "keyword c") return cont(expression);
      if (type == "(") return cont(pushlex(")"), expression, expect(")"), poplex, maybeoperator);
      if (type == "operator") return cont(expression);
      if (type == "[") return cont(pushlex("]"), commasep(expression, "]"), poplex, maybeoperator);
      if (type == "{") return cont(pushlex("}"), commasep(objprop, "}"), poplex, maybeoperator);
      return cont();
    }
    function maybeoperator(type, value) {
      if (type == "operator" && /\+\+|--/.test(value)) return cont(maybeoperator);
      if (type == "operator") return cont(expression);
      if (type == ";") return;
      if (type == "(") return cont(pushlex(")"), commasep(expression, ")"), poplex, maybeoperator);
      if (type == ".") return cont(property, maybeoperator);
      if (type == "[") return cont(pushlex("]"), expression, expect("]"), poplex, maybeoperator);
    }
    function maybelabel(type) {
      if (type == ":") return cont(poplex, statement);
      return pass(maybeoperator, expect(";"), poplex);
    }
    function property(type) {
      if (type == "variable") {cx.marked = "property"; return cont();}
    }
    function objprop(type) {
      if (type == "variable") cx.marked = "property";
      if (atomicTypes.hasOwnProperty(type)) return cont(expect(":"), expression);
    }
    function commasep(what, end) {
      function proceed(type) {
        if (type == ",") return cont(what, proceed);
        if (type == end) return cont();
        return cont(expect(end));
      }
      return function commaSeparated(type) {
        if (type == end) return cont();
        else return pass(what, proceed);
      };
    }
    function block(type) {
      if (type == "}") return cont();
      return pass(statement, block);
    }
    function vardef1(type, value) {
      if (type == "variable"){register(value); return cont(vardef2);}
      return cont();
    }
    function vardef2(type, value) {
      if (value == "=") return cont(expression, vardef2);
      if (type == ",") return cont(vardef1);
    }
    function forspec1(type) {
      if (type == "var") return cont(vardef1, forspec2);
      if (type == ";") return pass(forspec2);
      if (type == "variable") return cont(formaybein);
      return pass(forspec2);
    }
    function formaybein(type, value) {
      if (value == "in") return cont(expression);
      return cont(maybeoperator, forspec2);
    }
    function forspec2(type, value) {
      if (type == ";") return cont(forspec3);
      if (value == "in") return cont(expression);
      return cont(expression, expect(";"), forspec3);
    }
    function forspec3(type) {
      if (type != ")") cont(expression);
    }
    function functiondef(type, value) {
      if (type == "variable") {register(value); return cont(functiondef);}
      if (type == "(") return cont(pushlex(")"), pushcontext, commasep(funarg, ")"), poplex, statement, popcontext);
    }
    function funarg(type, value) {
      if (type == "variable") {register(value); return cont();}
    }

    // Interface

    return {
      startState: function(basecolumn) {
        return {
          tokenize: jsTokenBase,
          reAllowed: true,
          cc: [],
          lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
          localVars: null,
          context: null,
          indented: 0
        };
      },

      token: function(stream, state) {
        if (stream.sol()) {
          if (!state.lexical.hasOwnProperty("align"))
            state.lexical.align = false;
          state.indented = stream.indentation();
        }
        if (stream.eatSpace()) return null;
        var style = state.tokenize(stream, state);
        if (type == "comment") return style;
        state.reAllowed = type == "operator" || type == "keyword c" || type.match(/^[\[{}\(,;:]$/);
        return parseJS(state, style, type, content, stream);
      },

      indent: function(state, textAfter) {
        if (state.tokenize != jsTokenBase) return 0;
        var firstChar = textAfter && textAfter.charAt(0), lexical = state.lexical,
            type = lexical.type, closing = firstChar == type;
        if (type == "vardef") return lexical.indented + 4;
        else if (type == "form" && firstChar == "{") return lexical.indented;
        else if (type == "stat" || type == "form") return lexical.indented + indentUnit;
        else if (lexical.info == "switch" && !closing)
          return lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit);
        else if (lexical.align) return lexical.column + (closing ? 0 : 1);
        else return lexical.indented + (closing ? 0 : indentUnit);
      },

      electricChars: ":{}"
    };
  });

  // CodeMirror.defineMIME("text/javascript", "javascript");
  // CodeMirror.defineMIME("application/json", {name: "javascript", json: true});

  $(".jsonEditor").each(function() {
    CodeMirror.fromTextArea(this, {
      lineNumbers: true,
      matchBrackets: true,
      mode: { name: "javascript", htmlMode: false }
    });
  });

  $(".htmlEditor").each(function() {
    CodeMirror.fromTextArea(this, {
      mode: { name: "xml", htmlMode: true }
    });
  });
  
  $(".jsEditor").each(function() {
    CodeMirror.fromTextArea(this, {
      lineNumbers: true,
      matchBrackets: true,
      mode: { name: "javascript", htmlMode: false }
    });
  });
  
  $(".resultEditor").each(function() {
    CodeMirror.fromTextArea(this, {
      lineNumbers: true,
      matchBrackets: true,
      mode: { name: "xml", htmlMode: true }
    });
  });

  var percentageShown = 10;
  $('.panel').mouseenter(function() {
    $('.panel').stop(true);

    var
    el       = $(this),
    siblings = el.siblings().andSelf(),
    passed   = false,
    largest  = 100 - siblings.length*percentageShown,
    current  = 0;

    if (el.hasClass('result')) {
      el.find('.toggle').fadeIn();
    } else {
      el.parent().find('.result .toggle').fadeOut();
    }

    siblings.each(function(index) {

      $(this).animate({ 'left': current + '%' }, 300, function() {
        $('.panel .CodeMirror-scroll').css('overflow', 'auto');
      });

      if (this === el[0]) {
        current += largest;
      } else {
        current += percentageShown;
      }
    });
  }).mouseleave(function() {
    $('.panel').stop(true);
    $('.CodeMirror-scroll', this).css('overflow', 'hidden');  
  });

  $('.toggle').toggle(
    function() {
      $('.panel.result .CodeMirror').fadeOut();
      $('.toggle').addClass('depressed');
    }, 
    function() {
      $('.panel.result .CodeMirror').fadeIn();
      $('.toggle').removeClass('depressed');
    }
  );
  
  var bounce = null;
  
  $('.CodeMirror').keyup(function() {
    clearTimeout(bounce);
    bounce = setTimeout(function() {
    
      var json = $('.json .CodeMirror-lines', this).text();
      var html = $('.html .CodeMirror-lines', this).text();
      var js = $('.js .CodeMirror-lines', this).text();
    
      try {

      }
      catch(ex) {
        
      }
    
      
    }, 200);
    
  })

  if (document.querySelectorAll) {
    window.onload = function () {
      var menu = document.getElementById('menu');
      var init = menu.offsetTop;
      var docked;

      var headers = document.querySelectorAll('#docs h2, #synopsis h2');

      for (var i = 0; i < headers.length; i++) {
        headers[i].id = '-' + headers[i].innerHTML.toLowerCase().replace(/ /g, '-');
      }

      window.onscroll = function () {
        if (!docked && (menu.offsetTop - scrollTop() < 0)) {
          menu.style.top = 0;
          menu.style.position = 'fixed';
          menu.className = 'docked';
          docked = true;
        } else if (docked && scrollTop() <= init) {
          menu.style.position = 'absolute';
          menu.style.top = init + 'px';
          menu.className = menu.className.replace('docked', '');
          docked = false;
        }
      };


      (function () {
        var link     = document.getElementById('guide-link'),
            menu     = document.getElementById('menu'),
            dropdown = document.getElementById('dropdown');

        link.onmouseover = function () {
          link.className = 'dark-red';
          dropdown.style.display = 'block';
        };
        link.onmouseout = function (e) {
          if (e.relatedTarget === dropdown) { return }
          link.className = link.className.replace('dark-red', '');
          hide ();
        };
        dropdown.onmouseout = function (e) {
          var t = e.relatedTarget;

          if (e.target == link) { return }

          while (t !== document.body) {
            if (t == dropdown) { return }
            else               { t = t.parentNode }
          } 
          link.className = link.className.replace('dark-red', '');
          hide ();
        };

        function hide() { dropdown.style.display = 'none' }
      })();
    };
  } else {
    alert('Please upgrade to a modern browser to view this site.');
  }

  function scrollTop() {
    return document.body.scrollTop || document.documentElement.scrollTop;
  }
  
}();