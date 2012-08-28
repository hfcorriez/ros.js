## About

- 基于Redis API实现的Js的数据缓存
- API和Redis完全相同
- 适合开发Web App
- 目前还有一些API尚未实现

See api documents  on [redis.io](http://redis.io/commands)

## Install

    git clone git://github.com/hfcorriez/ros.js.git

## Usage
通用
____

    <script type="text/javascript" src="ros.js"></script>
    <script type="text/javascript">
    ros.set('test', 'mytestvalue');
    console.log(ros.get('test'));  // log "mytestvalue"
    </script>

jQuery中
____

    <script type="text/javascript" src="ros.js"></script>
    <script type="text/javascript" src="jquery.ros.js"></script>
    <script type="text/javascript">
    $.ros.set('test', 'mytestvalue');
    console.log($.ros.get('test'));  // log "mytestvalue"
    </script>