
<center>
![Alt text](https://github.com/hij1nx/Weld/raw/master/demo/public/img/weld.png)
</center>

weld is template antimatter for Javascript+JSON. It is the antithesis of most templating technology.
There is no special sugar required to add data into your markup. And best of all it works in the 
browser and your node.js server!

## How does this work?

markup + instructions + data = html

## Motivation

- Promote portable code/markup.
- Standards compliant. No workarounds such as <%=foo%> or {foo}.
- More readable code/markup.
- Increase maintainability by decoupling desperate technologies. 

## Usage

weld is a jQuery plugin. Why jQuery? A lot of people know how to use it. But don't worry, this is a very light-weight plugin.
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
