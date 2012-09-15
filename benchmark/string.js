var ros = require('./../lib/ros');

benchmark(
  function () {
    for (var i = 0; i < 100000; i++) {
      ros.set('bm.' + i, i);
    }
    return 'set()';
  },
  function () {
    for (var i = 0; i < 100000; i++) {
      ros.get('bm.' + i);
    }
    return 'get()';
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