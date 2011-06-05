![Alt text](https://github.com/hij1nx/weld/raw/master/documentation-assets/github-header.png)<br/>

## What is it?

Simple. Weld binds data to markup, and can generate markup based on your data. There's NO special syntax or data reshaping required. It works in the browser and in node.js! Weld is currently 3.66Kb uglified with no dependencies other than a valid DOM. Weld will apply values to elements the way that elements expect to have their values set.

## Motivation

- Standards compliant. No foreign concepts such as <%=foo%> or {{foo}}.
- Promote portable code/markup by decoupling decision making from presentation.
- Make both the code and markup more readable and maintainable.
- Allow designers to write up sample markup and test styling without a developer.
- Increase maintainability by developers with various skill sets.
- Code reuse between node.js and the browser


## How does it work?

Pass in a parent DOM Element, some data, and optionally some configuration details.
<pre><code>
  weld(element, data, [config]);
      
</code></pre>

`element` - This is the target node that will be used as the template.<br/>
`data` - This could be any data, an object an array, an array of objects, etc.<br/>
`config` - An object literal (optional), can include any of the items listed in the section below.<br/>

### Config options
`map` - A map function is executed against every match of data-key/element. It gives the opportunity to manipulate the element before it is finalized. Returning false from `map` will cause the traversal of the current branch to stop.
<pre><code>
  map: function(parent, element, key, val) { 
    return true; // returning false will cancel the traversal down this branch
  }
      
</code></pre>
`alias` - An object literal that provides a mapping between data key and a key that will match a class/name/id.  This is useful when you have data that doesn't explicitly correlate with the name, class or id of an HTML element. `alias` values may be any of the following:
 
 * A string
 * `false`
 * A function that returns a string, `false`, or a _single_ DOM Element
 
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
    },

    'personal_info'  : function(parent, element, key, value) {
      if (session.authorized() === false) {
        // The user requesting this template is not authorized to view other users' personal information so remove the personal info display from the page
        var emailDisplay = element.getElementById('personal_info');
        emailDisplay.parentNode.removeChild(emailDisplay);

        // and return false, which will stop weld from traversing the current branch (personal_info)
        return false;
      }
    }

  }
      
</code></pre>
`insert` (override) - A function which enables some logic to be performed before the element is actually inserted into the target.

see: https://github.com/hij1nx/weld/blob/master/lib/weld.js#L244 for the default implementation.
<pre><code>
  insert: function(parent, element) {
    parent.insertBefore(element, parent.firstChild);
  }
</code></pre>

`debug` - A boolean value that if set to true will display some useful information as the recursion process occurs. More information about this can be found later on in this document.
<pre><code>
  debug: true
       
</code></pre>

#### Advanced Options
The following options are the core of weld but can be overridden in special circumstances.  This is for hackers and these api's are known to be a bit volitile. **you have been warned**. and now for the list: `siblings`, `traverse`, `elementType`, `set` , `match`

As the weld core solidifies these methods will be properly documented, but for now you will need to look at the source.

## Installing from NPM (Node.js Package Manager)
<pre><code>
  npm install weld

</code></pre>
## Examples

### In Node.js
Using JSDOM, we can easily create a DOM, load some libraries and read a file. Let's weld some data!

      var fs    = require('fs'),
          jsdom = require('jsdom');

      jsdom.env(
        './test.html', 
        ['./jquery.js', './weld.js'],
        function(errors, window) {

          var data = [{ name: 'hij1nx',  title : 'code slayer' },
                      { name: 'tmpvar', title : 'code pimp' }];

          window.weld(window.$('.contact')[0], data);

        }
      );

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

      weld(document.querySelector('.contact'), data);

### Being explicit about how data-keys relate to elements

By default, weld uses a heuristic that assumes each of the keys in the data's `key: value` pairs is an '#id', a '.class' or 'name'. This addresses the 80/20 of cases. 

There are cases where the data is not an exact match to the element's identity. In this case, we can use the alias parameter to explicitly define the relationships between data-keys and an element's class/name/id. So, for the following HTML...

      <ul class='contacts'>
        <li class='contact'>
          <span>Hello my name is <span class='firstAndLast'>My Name</span></span>
          <p class='title'>Leet Developer</p>
        </li>
      </ul>

Use .contact as the template and `data` as the data...

      var data = [{ name: 'hij1nx',  title: 'code exploder' },
                  { name: 'tmpvar', title: 'code pimp' }],
 
          template = document.getElementByClassName('contact')[0];

Since there is no .name class in the markup, we need to alias name to something that does exist..

      weld(template, data, { alias: { 'name': 'firstAndLast' } });

This produces..

      <ul class='contacts'>
        <li class='contact'>
          <span>Hello my name is <span class='firstAndLast'>hij1nx</span></span>  
          <p class='title'>code slayer</p>
        </li>
        <li class='contact'>
          <span>Hello my name is <span class='firstAndLast'>tmpvar</span></span>  
          <p class='title'>code pimp</p>
        </li>  
      </ul>

### Working with multiple documents
Weld also supports using elements from one document as a data source to another. For example, the following markup in one document (source.html).

      <span>zero</span>
      <span>one</span>
      <span>two</span>

and in another document (dest.html)..

      <div id="dest">
        <ul>
          <li class='number'>This will be removed</li>
        </ul>
      </div>
 
Weld will automatically import the nodes into the proper document (dest.html)...

      jsdom.env(path.join(__dirname, 'files', 'source.html'), function(serrs, sw) {
        var sources = sw.document.getElementsByTagName("span");

        jsdom.env(path.join(__dirname, 'files', 'dest.html'), [jqpath, wpath], function(errors, window) {

          var $ = window.jQuery;

          window.weld($('li.number')[0], sources);

        });
      });

and insert them much like you would expect..

      <div id="dest">
        <ul>
          <li class="number">
            <span>zero</span>
          </li>
          <li class="number">
            <span>one</span>
          </li>
          <li class="number">
            <span>two</span>
          </li>
        </ul>
      </div>


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

### I do some crazy stuff in mustache, how do I do that in weld?
You won't need to do anything crazy in weld, weld is simply javascript, markup and data.

## Debugging
Debugging recursive data can be a real pain. With the `debug` option, you can see everything that happens as the data is recursed, such as elements that do or dont match, their parents, the keys and values, etc.

![Alt text](https://github.com/hij1nx/weld/raw/master/documentation-assets/debug.jpg)<br/>
![Alt text](https://github.com/hij1nx/weld/raw/master/documentation-assets/debug-browser.jpg)<br/>

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
    $.fn.weld = function (data, config) {
      return this.each (function () {
        weld(this, data, config);
      });
    };


## Credits
developed by [hij1nx][2] and [tmpvar][3]

If you want to learn more about JSDOM, go [here][1] it's an awesome project.

## Version
0.2.0

[1]: https://github.com/tmpvar/jsdom
[2]: http://twitter.com/hij1nx
[3]: http://twitter.com/tmpvar