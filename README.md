## About

ros.js is a redis like storage for javascript, it support both client and server(nodejs), it implements redis api. You can use it as memory storage simple and quickly both in client and server.

[![Build Status](https://secure.travis-ci.org/hfcorriez/ros.js.png)](http://travis-ci.org/hfcorriez/ros.js)

See api documents  on [redis.io](http://redis.io/commands)

## Install

    git clone git://github.com/hfcorriez/ros.js.git

## Usage

### in NodeJs

```javascript
var ros = require('ros');
ros.set('test', 'abc');
var test = ros.get('test'); // test = "abc"
```

### Normal in Browser

```html
<script type="text/javascript" src="ros.js">
<script type="text/javascript">
ros.set('test', 'abc');
var test = ros.get('test');  // test = "abc"
</script>
```

### JQuery in Browser

```html
<script type="text/javascript" src="ros.js">
<script type="text/javascript" src="jquery.ros.js">
<script type="text/javascript">
$.ros.set('test', 'abc');
var test = $.ros.get('test');  // test = "abc"
</script>
```