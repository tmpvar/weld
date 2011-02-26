

![Alt text](https://github.com/hij1nx/Weld/raw/master/demo/public/img/weld.png)<br/>

## What is it?

Simple. Weld turns data into markup. There's special syntax required. It works in the browser and in node.js!

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
Use with whatever library you want, jQuery for example.
<pre><code>
      $('.selector').weld(data, [config]);
      
</code></pre>

### element parameter
This is the target html which will be used as the template.

### data parameter
Could be any data, an object an array, an array of objects, etc.

### config parameter
An object literal (optional), can include any of the following...

`map` - A map function is executed against every match of data-key/element. It gives the opportunity to manipulate the element before it is finalized. Returning false from `map` will cause the traversal of the current branch to stop.
<pre><code>
      map: function(parent, element, key, val) { 
        return true; // returning false will cancel the traversal down this branch
      }
      
</code></pre>
`alias` - An object literal that will point one or more data-keys at an alternative selector. This is useful when you have data that doesn't explicitly correlate with the name, class or id of an HTML element.
<pre><code>
      alias: { 
        'myDataValueKey': '.someClassSelector',
        'otherKey': '#someId'
      }
      
</code></pre>
`insert` (optional) - A function which enables some logic to be performed   
<pre><code>
      insert: function(parent, element) {
         parent.insertBefore(element, parent.firstChild);
       }
       
</code></pre>
## NPM
<pre><code>
      npm install weld

</code></pre>
## Using weld a jQuery plug-in.


      /*
        @function {jQuery object}
          Turn weld into a jQuery plugin.

        @param {object} data
          The data which will be used for the weld.
        @param {object} config
          A configuration object.
      */

      if(jquery) {  
        $.fn.weld = function(data, config) {
          weld(this, data, config);
          return this;
        };
      }  


## Examples

### The basics
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

        window.jQuery = $; // let's use the jquery object!

        var data = [{ name: 'hij1nx',  title : 'code slayer' },
                    { name: 'tmpvar', title : 'code pimp' }];

        $('.contact').weld(data);
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

Using this data...
      var data = [{ name: 'hij1nx',  title: 'code exploder' },
                  { name: 'tmpvar', title: 'code pimp' }];  

Just add the bind parameter.
      weld('.contact', data, { bind: { 'name': '.firstAndLast', 'title': '.title' } });

This will produce...

      <ul class='contacts'>
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

          test.ok($('li.number').length === 3);
          test.ok($('li.number:nth(0) span').text() === "zero");
          test.ok($('li.number:nth(1) span').text() === "one");
          test.ok($('li.number:nth(2) span').text() === "two");
          test.ok($('li.number').text() === "zeroonetwo");
          test.done();
        });
      });


## Credits
developed by [hij1nx][2] and [tmpvar][3]

If you want to learn more about JSDOM, go [here][1] it's an awesome project.

## Version
0.1.0

[1]: https://github.com/tmpvar/jsdom
[2]: http://twitter.com/hij1nx
[3]: http://twitter.com/tmpvar
