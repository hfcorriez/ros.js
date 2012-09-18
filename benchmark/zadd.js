var ros = require('./../');

benchmark(
  function () {
    for (var i = 0; i < 10000; i++) {
      ros.zadd('zset', i, i);
    }
    return 'zadd()';
  },
  function () {
    for (var i = 0; i < 10000; i++) {
      ros.zrange('zset', i, i + 10);
    }
    return 'zrange()';
  },
  function () {
    for (var i = 0; i < 10000; i++) {
      ros.zrangebyscore('zset', i, i + 10);
    }
    return 'zrangebyscore()';
  }
);


function benchmark() {
  var start_time, run_time, name;
  for (var i = 0; i < arguments.length; i++) {
    start_time = (new Date()).valueOf();

    name = arguments[i].call(this);

    run_time = (new Date()).valueOf() - start_time;
    console.log(name + ' ' + Math.round((100000 / run_time) * 1000) + ' req/s');
  }
}