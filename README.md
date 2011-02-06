

![Alt text](https://github.com/hij1nx/Weld/raw/master/demo/public/img/weld.png)

weld is template antimatter for javascript. 

- Promotes code portability & separation of concerns.
- More readable and maintainable.

## How does this work?

templates + instructions + data = html

## Usage

the weld function looks like a jquery plugin.
<pre>
  $(selector).weld(data, [callback]);
</pre>

1) selector - just like jquery!

2) data - the source for the data that you want to populate the elements collected by the selector. this source can be one of the following...<br/>

- a selector, the html of another node<br/>
- a file<br/>
- an object literal<br/>
- an array of object literals<br/>

3) callback (optional) 

- if the data parameter is a file, the callback will get called after the file loads.
- if the data parameter is an array of objects, the callback will behave as a map function and it will be passed (in order) the element, key and value. For example...

<pre>
  $(".contacts").weld(data, function(element, key, value) {
    $(element).append("<" + key + ">" + value + "</" + key + ">");
  });  
</pre>

## Credits
developed by tmpvar and hij1nx!!

## Version
0.1.0
