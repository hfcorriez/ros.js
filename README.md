## About

    基于Redis API实现的Jquery数据存储，和Redis的操作完全一样，并且配合JS的灵活性可以创造更多的用途。

See api documents  on [redis.io](http://redis.io/)

## Install

    git clone git://github.com/hfcorriez/jquery-storage.git   

## Usage

    `<script type="text/javascript">
    $.storage.set('test', 'mytestvalue');
    console.log($.storage.get('test'));  // log "mytestvalue"
    // ... more usage will add.
    </script>`
