# Weld

Weld is template antimatter for javascript. 

- Promotes code portability & separation of concerns.
- More readable and maintainable.

## How does this work?

templates + instructions + data = html

## Usage

weld takes three arguments.
<pre>
  weld(<i>selector, data, [callback]</i>);
</pre>

1) selector - just like jquery!

2) data - the source for the data that you want to populate the elements collected by the selector. this source can be one of the following...<br/>

- a selector, the html of another node<br/>
- a file<br/>
- an object literal<br/>
- an array of object literals<br/>

3) callback (optional) - if the data parameter is a file, the callback will get called after the file loads. if the data parameter is an array, the callback will behave as a map function.
