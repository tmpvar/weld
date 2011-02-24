

![Alt text](https://github.com/hij1nx/Weld/raw/master/demo/public/img/weld.png)<br/>

## What is it?

Weld turns data into markup. There's NO sugar required. It works in the *browser* and in node.js! It was co-developed with the developer of JSDOM. *The next version will not require jQuery*.

## Motivation

- Standards compliant. No foreign concepts such as <%=foo%> or {{foo}}.
- Promote portable code/markup by decoupling decision making from presentation.
- More readable code/markup.
- Increase maintainability by developers with various skill sets.

## How does it work?

Get a collection of elements, provide your data, optionally provide configuration details.

    weld('.selector', data, [config]);


Use with whatever library you want, jQuery for example.

    $('.selector').weld(data, [config]);


### data parameter
Could be any data, an object an array, an array of objects, etc.

### config parameter
An object literal (optional), can include any of the following...

`map` - A map function will supply the current HTML element that will created for the data that's being iterated as well as the key and the data's value.

Returning false from `map` will cause the traversal of the current branch to stop.

    map: function(el, key, val) { 
      return true; // returning false will cancel the traversal down this branch
    }

`bind` - An object that explicitly maps the data's keys to css selectors.
 
    bind: { 
      'myDataValueKey': '.someClassSelector',
      'otherKey': '#someId'
    }


`overwrite` - Should we overwrite the old HTML? (true by default)

    overwrite: true

## NPM
    npm install weld

## Using weld a jQuery plug-in.
<pre>
/*
  @function {jQuery object}
    Turn weld into a very simple jQuery plugin.

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
</pre>

## Examples

Create a DOM, load a library, read a file and bind the data to it...

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

      window.jQuery = $;

      var data = [{ name: &quot;hij1nx&quot;,  title : &quot;code slayer&quot; },
                  { name: &quot;tmpvar&quot;, title : &quot;code pimp&quot; }];

      $('.contact').weld(data);
    });

</pre>

Here is the corresponding markup that our script above will load...
<pre>
&lt;ul class=&quot;contacts&quot;&gt;
  &lt;li class=&quot;contact&quot;&gt;
    &lt;span class=&quot;name&quot;&gt;My Name&lt;/span&gt;
    &lt;p class=&quot;title&quot;&gt;Leet Developer&lt;/p&gt;
  &lt;/li&gt;
&lt;/ul&gt;
</pre>

And here are the results that it will produce...
<pre>
&lt;ul class=&quot;contacts&quot;&gt;
  &lt;li class=&quot;contact&quot;&gt;
    &lt;span class=&quot;name&quot;&gt;hij1nx&lt;/span&gt;
    &lt;p class=&quot;title&quot;&gt;code slayer&lt;/p&gt;
  &lt;/li&gt;
  &lt;li class=&quot;contact&quot;&gt;
    &lt;span class=&quot;name&quot;&gt;tmpvar&lt;/span&gt;
    &lt;p class=&quot;title&quot;&gt;code pimp&lt;/p&gt;
  &lt;/li&gt;  
&lt;/ul&gt;
</pre>

### how data actually maps to the html

By default, weld uses a heuristic that assumes each of the keys in the data's `key: value` pairs is an '#id', a '.class' or 'name'. This addresses the 80/20 of cases. 

There are cases where you need to be more <b>explicit</b> and map a data key to an element or collection of elements. To do this, you can add a mapping of data keys to selectors. So, for the following HTML...

<pre>
&lt;ul class=&quot;contacts&quot;&gt;
  &lt;li class=&quot;contact&quot;&gt;
    &lt;span class=&quot;name&quot;&gt;Hello my name is &lt;span class=&quot;firstAndLast&quot;&gt;My Name&lt;/span&gt;&lt;/span&gt;
    &lt;p class=&quot;title&quot;&gt;Leet Developer&lt;/p&gt;
  &lt;/li&gt;
&lt;/ul&gt;
</pre>

Using this data...
    var data = [{ name: 'hij1nx',  title: 'code exploder' },
                { name: 'tmpvar', title: 'code pimp' }];  

Just add the bind parameter.
    weld('.contact', data, { bind: { 'name': '.firstAndLast', 'title': '.title' } });

This will produce...
<pre>
&lt;ul class=&quot;contacts&quot;&gt;
  &lt;li class=&quot;contact&quot;&gt;
    &lt;span class=&quot;name&quot;&gt;Hello my name is &lt;span class=&quot;firstAndLast&quot;&gt;hij1nx&lt;/span&gt;&lt;/span&gt;  
    &lt;p class=&quot;title&quot;&gt;code slayer&lt;/p&gt;
  &lt;/li&gt;
  &lt;li class=&quot;contact&quot;&gt;
    &lt;span class=&quot;name&quot;&gt;Hello my name is &lt;span class=&quot;firstAndLast&quot;&gt;tmpvar&lt;/span&gt;&lt;/span&gt;  
    &lt;p class=&quot;title&quot;&gt;code pimp&lt;/p&gt;
  &lt;/li&gt;  
&lt;/ul&gt;
</pre>

## Credits
developed by [hij1nx][2] and [tmpvar][3]

If you want to learn more about JSDOM, go [here][1] it's an awesome project.

## Version
0.1.0

[1]: https://github.com/tmpvar/jsdom
[2]: http://twitter.com/hij1nx
[3]: http://twitter.com/tmpvar
