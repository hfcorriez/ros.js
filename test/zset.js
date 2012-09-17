if (typeof module != 'undefined') {
  var ros = require('../')
    , assert = require('assert');
}

describe('ZSet', function () {
  beforeEach(function () {
    ros.del('zset.1');
    ros.del('zset.2');
    ros.del('zset.3');
    ros.zadd('zset.1', 1, 'a');
    ros.zadd('zset.1', 2, 'b');
    ros.zadd('zset.1', 3, 'c');
    ros.zadd('zset.2', 4, 'c');
    ros.zadd('zset.2', 5, 'd');
  });
  describe('zrange()', function () {
    it('Get range', function () {
      assert(['c', 'd'].toString() === ros.zrange('zset.2', 0, -1).toString());
    });
    it('Get range of non-exists set', function () {
      assert([].toString() === ros.zrange('zset.3', 0, -1).toString());
    });
    it('Get range and scores', function () {
      assert({'c': 4, 'd': 5}.toString() === ros.zrange('zset.2', 0, -1, true).toString());
    });
  });

  describe('zrem()', function () {
    it('Remove element', function () {
      assert(1 === ros.zrem('zset.1', 'b'));
      assert(['a', 'c'].toString() === ros.zrange('zset.1', 0, -1).toString());
    });
  });

  describe('zadd()', function () {
    it('Add exists element', function () {
      assert(0 === ros.zadd('zset.1', 1, 'b'));
    });
    it('Add non-exists element', function () {
      assert(1 === ros.zadd('zset.2', 7, 'e'));
    });
    it('Add element to non-exists set', function () {
      assert(1 === ros.zadd('zset.3', 1, 'a'));
    });
    it('Add exists element', function () {
      assert(0 === ros.zadd('zset.1', 4, 'a'));
      assert(['b', 'c', 'a'].toString() === ros.zrange('zset.1', 0, -1).toString());
    });
  });

  describe('zscore()', function () {
    it('Get score of exists value', function () {
      assert(2 === ros.zscore('zset.1', 'b'));
    });

    it('Get score of non-exists value', function () {
      assert(false === ros.zscore('zset.1', 'abcdef'));
    });

    it('Get score from non-exists set', function () {
      assert(false === ros.zscore('zset.3', 'a'));
    });
  });

  describe('zrank()', function () {
    it('Get rank of exists value', function () {
      assert(0 === ros.zrank('zset.1', 'a'));
    });

    it('Get rank of non-exists value', function () {
      assert(false === ros.zrank('zset.1', 'bsfaasdf'));
    });

    it('Get rank from non-exists set', function () {
      assert(false === ros.zrank('zset.3', 'b'));
    });
  });

  describe('zrevrank()', function () {
    it('Get reverse rank of exists value', function () {
      assert(2 === ros.zrevrank('zset.1', 'a'));
    });

    it('Get reverse rank of non-exists value', function () {
      assert(false === ros.zrevrank('zset.1', 'bsfaasdf'));
    });

    it('Get reverse rank from non-exists set', function () {
      assert(false === ros.zrevrank('zset.3', 'b'));
    });
  });

  describe('zcard()', function () {
    it('Get total count', function () {
      assert(3 === ros.zcard('zset.1'));
    });

    it('Get total count of non-exists set', function () {
      assert(0 === ros.zcard('zset.3'));
    });
  });

  describe('zcount()', function () {
    it('Get count', function () {
      assert(3 === ros.zcount('zset.1', 0, -1));
      assert(1 === ros.zcount('zset.1', 1, 1));
    });

    it('Get count of non-exists set', function () {
      assert(0 === ros.zcount('zset.3', 0, -1));
    });
  });

  describe('zrangebyscore()', function () {
    it('Get range with score', function () {
      assert(['b', 'c'].toString() === ros.zrangebyscore('zset.1', 1.5, 3).toString());
    });
  });

  describe('zrevrange()', function () {
    it('Get reverse range of sorted set', function () {
      assert(['d', 'c'].toString() === ros.zrevrange('zset.2', 0, -1).toString());
    });
  });

  describe('zrevrangebyscore()', function () {
    it('Get range with score', function () {
      assert(['c', 'b'].toString() === ros.zrevrangebyscore('zset.1', 1.5, 3).toString());
    });
  });

  describe('zremrangebyrank()', function () {
    it('Remove elements by rank', function () {
      assert(2 === ros.zremrangebyrank('zset.1', 0, 1));
      assert(['c'].toString() == ros.zrange('zset.1', 0, -1).toString());
    });
  });

  describe('zremrangebyscore()', function () {
    it('Remove elements by rank', function () {
      assert(1 === ros.zremrangebyscore('zset.1', 1.5, 2));
      assert(['a', 'c'].toString() == ros.zrange('zset.1', 0, -1).toString());
    });
  });

  describe('zincrby()', function () {
    it('Increase element score', function () {
      assert(3.5 === ros.zincrby('zset.1', 1.5, 'b'));
      assert(['a', 'c', 'b'].toString() === ros.zrange('zset.1', 0, -1).toString());
    });
  });
});