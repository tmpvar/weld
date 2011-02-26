

![Alt text](https://github.com/hij1nx/Weld/raw/master/demo/public/img/weld.png)<br/>

## What is it?

Simple. Weld binds data to markup, and can generate markup based your data. There's NO special syntax or data reshaping required. It works in the browser and in node.js!

## Motivation

- Standards compliant. No foreign concepts such as <%=foo%> or {{foo}}.
- Promote portable code/markup by decoupling decision making from presentation.
- More readable code/markup.
- Increase maintainability by developers with various skill sets.

## How does it work?

Get a collection of elements, provide your data, optionally provide configuration details.
<pre><code>
  weld(element, data, [config]);
      
</code></pre>

### element parameter
This is the target node that will be used as the template.

### data parameter
This could be any data, an object an array, an array of objects, etc.

### config parameter
An object literal (optional), can include any of the following...

`map` - A map function is executed against every match of data-key/element. It gives the opportunity to manipulate the element before it is finalized. Returning false from `map` will cause the traversal of the current branch to stop.
<pre><code>
  map: function(parent, element, key, val) { 
    return true; // returning false will cancel the traversal down this branch
  }
      
</code></pre>
`alias` - An object literal that provides a mapping between data key and a key that will match a class/name/id.  This is useful when you have data that doesn't explicitly correlate with the name, class or id of an HTML element. `alias` values may be any of the following:
 
 * A string
 * A boolean
 * A function that returns a string
 * A function that returns a _single_ DOM Element
 
<pre><code>
  alias: { 
    'user_password': false, // causes an item to not get rendered

    'user_email': 'email', // use email instead of user_email in the weld match process

    'user_name'     : function(parent, element, key, value) {
      // element is a DOM Element which will be searched for the current key

      // use fullName in place of user_name
      return "fullName"
    },

    'user_hometown' : function(parent, element, key, value) {
      // use an element instead of allowing weld to match based on class/id/name
      return element.getElementById('hometown');
    }
  }
      
</code></pre>
`insert` (optional) - A function which enables some logic to be performed before the element is actually inserted into the target.
<pre><code>
  insert: function(parent, element) {
    parent.insertBefore(element, parent.firstChild);
  }
       
</code></pre>
`debug` - A boolean value that if set to true will display some useful information as the recursion process occurs. More information about this can be found later on in this document.
<pre><code>
  debug: true
       
</code></pre>
## Installing from NPM (Node.js Package Manager)
<pre><code>
  npm install weld

</code></pre>
## Examples

### In Node.js
Using JSDOM, we can easily create a DOM, load some libraries and read a file. Let's bind some data!

      var fs    = require('fs'),
          jsdom = require('jsdom'),

      jsdom.env({
        code: [
          '/../lib/jquery.js',
          'path/to/weld.js'
        ],
        html: '/../files/contexts.html'
      },
      function(window) {

        window.jQuery = $; // let's use jQuery to get our target node!

        var data = [{ name: 'hij1nx',  title : 'code slayer' },
                    { name: 'tmpvar', title : 'code pimp' }];

        window.weld($('.contact')[0], data);

      });

Here is the corresponding markup that our script above will load...

      <ul class='contacts'>
        <li class='contact'>
          <span class='name'>My Name</span>
          <p class='title'>Leet Developer</p>
        </li>
      </ul>

Here are the results that it will produce...

      <ul class='contacts'>
        <li class='contact'>
          <span class='name'>hij1nx</span>
          <p class='title'>code slayer</p>
        </li>
        <li class='contact'>
          <span class='name'>tmpvar</span>
          <p class='title'>code pimp</p>
        </li>  
      </ul>

### In the browser

index.html

      <!DOCTYPE html>
      <html>
        <head>
        </head>
        <body>
          <ul class='contacts'>
            <li class='contact'>
              <span class='name'>My Name</span>
              <p class='title'>Leet Developer</p>
            </li>
          </ul>
          <script src="lib/weld.js" type="text/javascript" charset="utf-8"></script>
          <script src="js/index.js" type="text/javascript" charset="utf-8"></script>
        </body>
      </html>

index.js

      var data = [{ name: 'hij1nx',  title : 'code slayer' },
                  { name: 'tmpvar', title : 'code pimp' }];

      window.weld(document.querySelector('.contact'), data);

### Being explicit about how data-keys relate to elements

By default, weld uses a heuristic that assumes each of the keys in the data's `key: value` pairs is an '#id', a '.class' or 'name'. This addresses the 80/20 of cases. 

There are cases where the data is not an exact match to the element's identity. In this case, we can create 


ou need to be more explicit and map a data key to an element or collection of elements. To do this, you can add a mapping of data keys to selectors. So, for the following HTML...

      <ul class='contacts'>
        <li class='contact'>
          <span class='name'>Hello my name is <span class='firstAndLast'>My Name</span></span>
          <p class='title'>Leet Developer</p>
        </li>
      </ul>

Use #contact as the template and `data` as the data...

      var
      data     = [{ name: 'hij1nx',  title: 'code exploder' },
                  { name: 'tmpvar', title: 'code pimp' }],
 
      template = document.getElementById('contacts');

Just add the alias parameter.

      weld(template, data, { alias: { 'name': 'firstAndLast', 'title': 'title' } });

This will produce...

      <ul id='contacts'>
        <li class='contact'>
          <span class='name'>Hello my name is <span class='firstAndLast'>hij1nx</span></span>  
          <p class='title'>code slayer</p>
        </li>
        <li class='contact'>
          <span class='name'>Hello my name is <span class='firstAndLast'>tmpvar</span></span>  
          <p class='title'>code pimp</p>
        </li>  
      </ul>

### Working with multiple documents
It's easy to work with multiple documents.

      jsdom.env(path.join(__dirname, 'files', 'source.html'), function(serrs, sw) {
        var sources = sw.document.getElementsByTagName("span");

        jsdom.env(path.join(__dirname, 'files', 'dest.html'),[jqpath, wpath], function(errors, window) {

          var $ = window.jQuery;

          window.weld($('li.number')[0], sources);

        });
      });


## How do I...
For people coming from custom templating paradigms, you might have some of 'how-do-i-do-x' questions.

### Conditionals
You may want to only render a section of markup depending on the data.

      <% if(person.description) { %>

      <% } %>

This can be done with the map or alias parameters.

      alias: {
        description: false // causes the descriptions to never get rendered.
      }
      
which is the same as this...

      alias: function(parent, element, key, value) {
        if(key==='description') {
          return false;
        }
      }

but can also be done with the more general purpose `map` parameter.

      map: function(parent, element, key, val) { 
        if(key==='description') {
          return false;
        }
      }

### I do some crazy stuff in mustache, how do i do that in weld?
Chances are that you wont need to do anything crazy in weld, it's just javascript, markup and data.

## Debugging
Debugging recursive data can be a real pain. With the debug option, you can see everything that happens as the data is recursed, such as elements that do or dont match, their parents, the keys and values, etc.

![Alt text](https://github.com/hij1nx/weld/raw/master/documentation-assets/debug.jpg)<br/>

## Using weld as a plugin to other libraries

### jQuery
    /*
      @function {jQuery object}
        Turn weld into a jQuery plugin.
      @param {object} data
        The data which will be used for the weld.
      @param {object} config
        An optional configuration object.

      Example: $('contacts').weld([ { name: 'John' } ])
    */
    $.fn.weld = function(data, config) {
      weld(this[0], data, config);
      return this;
    };


## Credits
developed by [hij1nx][2] and [tmpvar][3]

If you want to learn more about JSDOM, go [here][1] it's an awesome project.

## Version
0.2.0

[1]: https://github.com/tmpvar/jsdom
[2]: http://twitter.com/hij1nx
[3]: http://twitter.com/tmpvar
