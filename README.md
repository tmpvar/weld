
![Alt text](https://github.com/hij1nx/Weld/raw/master/demo/public/img/weld.png)<br/>

## What is it?

Weld is like template antimatter for Javascript. It is the antithesis of most templating technology. There is no voodoo or special sugar required to add data into your markup. Simply, markup + instructions + data = html. And best of all it works in the *browser* and on your *node.js* server!

## Motivation

Most micro templating solutions require you to pepper your markup with 'stubs' or 'placeholders', which is non-standard.

- Standards compliant. No workarounds such as <%=foo%> or {foo}.
- Promote portable code/markup by decoupling desperate technologies.
- More readable code/markup.
- Increase maintainability by developers with various skill sets.

## How does it work?

<b>Usage</b>

weld can be used as a function or as a jQuery plugin. Why jQuery? A lot of people know how to use it, but mostly for the selector  engine. But don't fret, it's a very light-weight plugin.

<pre>
  $(selector).weld(data, [config]);
</pre>
or
<pre>
  weld('.selector', data, [config]);
</pre>

The <b>data</b> parameter, an object or an array.
It's the data that you will use to populate the element collection.<br/>

The <b>config</b> parameter, an object literal (optional).

- map: function(el, key, val) { return el; } // Specify a map function to manipulate the current element.
- overwrite: true || false // append or not to the list that has already had a weld.

<pre>
  $(&quot;.contacts&quot;).weld(data, function(element, key, value) {
    $(element).append(&quot;&lt;&quot; + key + &quot;&gt;&quot; + value + &quot;&lt;/&quot; + key + &quot;&gt;&quot;);
  });
</pre>

<b>Examples</b>

Here is some logic to create a DOM, load jQuery, read a file and Weld something...
<pre>
var fs = require(&#x27;fs&#x27;),
    jsdom = require(&#x27;jsdom&#x27;),
    html = function(file, cb) {
      
      file = __dirname + &#x27;/files/&#x27; + file;
      fs.readFile(file, function(err, data) {
        
        if (err) {
          return cb(err);
        }

        var window = jsdom.html(data.toString()).createWindow();
        jsdom.jQueryify(window, __dirname + &#x27;/../lib/jquery.js&#x27;, function() {

          window.$(&#x27;script:last&#x27;).remove();
          
          var weldTag = window.document.createElement(&#x27;script&#x27;);
          
          weldTag.src = &#x27;file://&#x27; + __dirname + &#x27;/../lib/weld.js&#x27;;
          weldTag.onload = function() {
            // remove the weld scripttag
            window.$(&#x27;script:last&#x27;).remove();
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

By default, Weld uses a heuristic that assumes each of the keys in the data's `key: value` pairs is an '#id', a '.class' or 'name'. This addresses the 80/20 of cases. If you want, you can supply more explicit instructions by providing a selectors parameter which maps a key with selectors.

To be more explicit during binding, let's say you have html where a span has the class 'name', but you don't want the data with the key 'name' to map to that, you want it to map to something else...

<pre>
  &lt;ul class=&quot;contacts&quot;&gt;
    &lt;li class=&quot;contact&quot;&gt;
      &lt;span class=&quot;name&quot;&gt;Hello my name is &lt;span class=&quot;firstAndLast&quot;&gt;My Name&lt;/span&gt;&lt;/span&gt;
      &lt;p class=&quot;title&quot;&gt;Leet Developer&lt;/p&gt;
    &lt;/li&gt;
  &lt;/ul&gt;
</pre>

Let's say this is the data to bind...

<pre>
var data = [{ name: &#x27;Paulo&#x27;,  title: &#x27;code exploder&#x27; },
            { name: &#x27;Elijah&#x27;, title: &#x27;code pimp&#x27; }];  
</pre>

Just add explicit assignments with the bind parameter.

<pre>
  weld(&#x27;.contact&#x27;, data, { bind: { &#x27;name&#x27;: &#x27;.firstAndLast&#x27;, &#x27;title&#x27;: &#x27;.title&#x27; } });
</pre>

## Credits
developed by tmpvar and hij1nx!!

If you want to learn more about JSDOM, go [here][1] it's an awesome project.

## Version
0.1.0

[1]: https://github.com/tmpvar/jsdom