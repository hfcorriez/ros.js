if (typeof module != 'undefined') {
  var ros = require('../')
    , assert = require('assert');
}

describe('List', function () {
  beforeEach(function () {
    ros.del('list.1');
    ros.del('list.2');
    ros.del('list.3');
    ros.lpush('list.1', 'a');
    ros.lpush('list.1', 'b');
    ros.lpush('list.1', 'c');
    ros.lpush('list.2', 'c');
    ros.lpush('list.2', 'd');
  });

  describe('llen()', function () {
    it('Get length of exists list', function () {
      assert(3 === ros.llen('list.1'));
    });

    it('Get length of non-exists list', function () {
      assert(0 === ros.llen('list.3'));
    });
  });

  describe('lpop()', function () {
    it('Pop elements from left', function () {
      assert('c' === ros.lpop('list.1'));
      assert('b' === ros.lpop('list.1'));
      assert('a' === ros.lpop('list.1'));
      assert(false === ros.lpop('list.1'));
    });
  });

  describe('rpop()', function () {
    it('Pop elements from right', function () {
      assert('a' === ros.rpop('list.1'));
      assert('b' === ros.rpop('list.1'));
      assert('c' === ros.rpop('list.1'));
      assert(false === ros.rpop('list.1'));
    });
  });

  describe('lpush()', function () {
    it('Push elements from left', function () {
      assert(4 === ros.lpush('list.1', 'd'));
      assert('d' === ros.lpop('list.1'));
    });

    it('Push elements to non-exists list from left', function () {
      assert(1 === ros.lpush('list.3', 'd'));
      assert('d' === ros.lpop('list.3'));
    });
  });

  describe('rpush()', function () {
    it('Push elements from right', function () {
      assert(4 === ros.rpush('list.1', 'd'));
      assert('d' === ros.rpop('list.1'));
    });

    it('Push elements to non-exists list from right', function () {
      assert(1 === ros.rpush('list.3', 'd'));
      assert('d' === ros.rpop('list.3'));
    });
  });

  describe('lpushx()', function () {
    it('Pushx elements from left', function () {
      assert(4 === ros.lpushx('list.1', 'd'));
      assert('d' === ros.lpop('list.1'));
    });

    it('Pushx elements to non-exists list from left', function () {
      assert(0 === ros.lpushx('list.3', 'd'));
      assert(false === ros.lpop('list.3'));
    });
  });

  describe('rpushx()', function () {
    it('Pushx elements from right', function () {
      assert(4 === ros.rpushx('list.1', 'd'));
      assert('d' === ros.rpop('list.1'));
    });

    it('Pushx elements to non-exists list from right', function () {
      assert(0 === ros.rpushx('list.3', 'd'));
      assert(false === ros.rpop('list.3'));
    });
  });

  describe('lrange()', function () {
    it('Get all from exists list', function () {
      assert(['c', 'b', 'a'].toString() === ros.lrange('list.1', 0, -1).toString());
    });

    it('Get range from exists list', function () {
      assert(['b', 'a'].toString() === ros.lrange('list.1', 1, 2).toString());
    });

    it('Get all from non-exists list', function () {
      assert([].toString() === ros.lrange('list.3', 0, -1).toString());
    });
  });

  describe('ltrim()', function () {
    it('Trim exists list', function () {
      assert(true === ros.ltrim('list.1', 0, -1));
      assert(['c', 'b', 'a'].toString() === ros.lrange('list.1', 0, -1).toString());
    });

    it('Trim range of exists list', function () {
      assert(true === ros.ltrim('list.1', 0, 1));
      assert(['c', 'b'].toString() === ros.lrange('list.1', 0, -1).toString());
    });

    it('Trim non-exists list', function () {
      assert(false === ros.ltrim('list.3', 0, -1));
    });
  });

  describe('lindex()', function () {
    it('Get element with index', function () {
      assert('c' === ros.lindex('list.1', 0));
      assert('b' === ros.lindex('list.1', 1));
    });

    it('Get element with negative index', function(){
      assert('a' === ros.lindex('list.1', -1));
    });
  });

  describe('lset()', function () {
    it('Insert element to list', function () {
      assert(true === ros.lset('list.1', 0, 'test'));
      assert(3 === ros.llen('list.1'));
      assert('test' === ros.lindex('list.1', 0));
    });
  });

  describe('lrem()', function () {
    it('Remove elements from list', function () {
      assert(1 === ros.lrem('list.1', 1, 'a'));
      assert(['c', 'b'].toString() === ros.lrange('list.1', 0, -1).toString());
    });

    it('Remove multiple elements from list', function () {
      ros.lpush('list.1', 'a');
      ros.lpush('list.1', 'a');
      assert(2 === ros.lrem('list.1', 2, 'a'));
      assert(['c', 'b', 'a'].toString() === ros.lrange('list.1', 0, -1).toString());
    });

    it('Remove multiple elements with negative count from list', function () {
      ros.lpush('list.1', 'a');
      ros.lpush('list.1', 'a');
      assert(2 === ros.lrem('list.1', -2, 'a'));
      assert(['a', 'c', 'b'].toString() === ros.lrange('list.1', 0, -1).toString());
    });
  });

  describe('rpoplpush()', function () {
    it('Pop list from right a element and push it to other from left', function () {
      assert('a' === ros.rpoplpush('list.1', 'list.2'));
      assert(['c', 'b'].toString() === ros.lrange('list.1', 0, -1).toString());
      assert(['a', 'd', 'c'].toString() === ros.lrange('list.2', 0, -1).toString());
    });
  });
});