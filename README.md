

![Alt text](https://github.com/hij1nx/Weld/raw/master/demo/public/img/weld.png)

weld is template antimatter for Javascript+JSON. It is the antithesis of most templating technology.
There is no special sugar required to add to interject data with markup. And best of all it works in 
the browser and on the server!

## How does this work?

templates + instructions + data = html

## Motivation

- Promote portability.
- Standards compliant. No workarounds such as <%=foo%> or {foo}.
- More readable.
- Increase maintainability by decoupling desperate technologies. 

## Usage

weld is a jQuery plugin.
<pre>
  $(selector).weld(data, [callback]);
</pre>

The <b>data</b> parameter, an object or array.
The source for the data that you want to populate the elements collected by the selector. this source can be one of the following...<br/>

- a selector, the html of another node<br/>
- an object literal<br/>
- an array of object literals<br/>

The <b>callback</b> parameter, a function is optional.
The callback will behave as a map function and it will be passed (in order) the element, key and value. For example...

<pre>
  $(".contacts").weld(data, function(element, key, value) {
    $(element).append("<" + key + ">" + value + "</" + key + ">");
  });  
</pre>

## Credits
developed by tmpvar and hij1nx!!

## Version
0.1.0
