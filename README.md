
![Alt text](https://github.com/hij1nx/Weld/raw/master/demo/public/img/weld.png)<br/>

## What?

Weld is like template antimatter for Javascript. It is the antithesis of most templating technology. There is no voodoo 
or special sugar required to add data into your markup. Simply, markup + instructions + data = html. And best of all it 
works in the *browser* and on your *node.js* server!

## Why?

Everyone has their own idea of how micro templating should work. Most templating requires you to pepper your markup 
with 'stubs' or 'placeholders'. It's non-standard and the community is divided on the best way to pollute the markup. 
The motivation...

- Standards compliant. No workarounds such as <%=foo%> or {foo}.
- Promote portable code/markup by decoupling desperate technologies.
- More readable code/markup.
- Increase maintainability by developers with various skill sets.

## How?

<b>Usage</b>

weld can be used as a simple function or as a jQuery plugin. Why jQuery? A lot of people know how to use it, but mostly 
for the selector engine. But don't worry, this is a very light-weight plugin.

<pre>
  $(selector).weld(data, [callback]);
</pre>

The <b>data</b> parameter, an object or an array.
It's the data that you will use to populate the element collection.<br/>

The <b>callback</b> parameter, a function (optional).
The callback is a map function, it's passed the element, key and value. For example...

<pre>
  $(".contacts").weld(data, function(element, key, value) { // TODO: make the key/val stuff work properly
    $(element).append("<" + key + ">" + value + "</" + key + ">");
  });
</pre>

<b>Examples</b>

Here is some logic to create a DOM, load jQuery, read a file and Weld something...
<pre>
var fs = require('fs')
    ,jsdom = require('jsdom')
    ,html       = function(file, cb) {
      file = __dirname + '/files/' + file;
      fs.readFile(file, function(err, data) {
        
        if (err) {
          return cb(err);
        }

        var window = jsdom.html(data.toString()).createWindow();
        jsdom.jQueryify(window, __dirname + '/../lib/jquery.js', function() {

          window.$('script:last').remove();
          
          var weldTag = window.document.createElement('script');
          
          weldTag.src = 'file://' + __dirname + '/../lib/weld.js';
          weldTag.onload = function() {
            // remove the weld scripttag
            window.$('script:last').remove();
            cb(null, window.weld, window.$, window);
          };
          window.document.body.appendChild(weldTag);
        });
      })
    };
  
html('contacts.html', function(err, weld, $, window) {
  var data = [{ name: &quot;Paolo&quot;,  title : &quot;Code Slayer&quot; },
            { name: &quot;Elijah&quot;, title : &quot;Code Pimp&quot; }];

  $(&#x27;.contact&#x27;).weld(data);
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
    &lt;span class=&quot;name&quot;&gt;Paolo&lt;/span&gt;
    &lt;p class=&quot;title&quot;&gt;Code Slayer&lt;/p&gt;
  &lt;/li&gt;
  &lt;li class=&quot;contact&quot;&gt;
    &lt;span class=&quot;name&quot;&gt;Elijah&lt;/span&gt;
    &lt;p class=&quot;title&quot;&gt;Code Pimp&lt;/p&gt;
  &lt;/li&gt;  
&lt;/ul&gt;
</pre>

"I want my data to append/prepend or be inserted before or after my last weld". No problem.

// TODO: write this part..

## Credits
developed by tmpvar and hij1nx!!

## Version
0.1.0
