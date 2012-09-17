if (typeof module != 'undefined') {
  var ros = require('../')
    , assert = require('assert');
}

describe('Hash', function () {
  beforeEach(function () {
    ros.del('hash.1');
    ros.del('hash.2');
    ros.del('hash.3');
    ros.hset('hash.1', 'a', 1);
    ros.hset('hash.1', 'b', 2);
    ros.hset('hash.1', 'c', 3);
    ros.hset('hash.2', 'c', 'c');
    ros.hset('hash.2', 'd', 'd');
  });

  describe('hexists()', function () {
    it('Check exists field in hash', function () {
      assert(true === ros.hexists('hash.1', 'a'));
    });

    it('Check non-exists field in hash', function () {
      assert(false === ros.hexists('hash.1', 'd'));
    });

    it('Check field in non-exists hash', function () {
      assert(false === ros.hexists('hash.3', 'd'));
    });
  });

  describe('hget()', function () {
    it('Get exists field from exists hash', function () {
      assert(1 === ros.hget('hash.1', 'a'));
    });

    it('Get non-exists field from exists hash', function () {
      assert(false === ros.hget('hash.1', 'd'));
    });

    it('Get non-exists field from non-exists hash', function () {
      assert(false === ros.hget('hash.3', 'd'));
    });
  });

  describe('hset()', function () {
    it('Set non-exists field to exists hash', function () {
      assert(1 === ros.hset('hash.1', 'd', 4));
    });

    it('Set exists field to exists hash', function () {
      assert(0 === ros.hset('hash.1', 'a', 2));
    });

    it('Set field to non-exists hash', function () {
      assert(1 === ros.hset('hash.3', 'a', 2));
    });
  });

  describe('hsetnx()', function () {
    it('Set non-exists field to exists hash', function () {
      assert(1 === ros.hsetnx('hash.1', 'd', 4));
    });

    it('Set exists field to exists hash', function () {
      assert(0 === ros.hsetnx('hash.1', 'a', 1));
    });

    it('Set field to non-exists hash', function () {
      assert(1 === ros.hsetnx('hash.3', 'a', 1));
    });
  });

  describe('hlen()', function () {
    it('Get length of exists hash', function () {
      assert(3 === ros.hlen('hash.1'));
    });

    it('Get length of non-exists hash', function () {
      assert(0 === ros.hlen('hash.3'));
    });
  });

  describe('hdel()', function () {
    it('Del exists field from hash', function () {
      assert(1 === ros.hdel('hash.1', 'a'));
      assert(false === ros.hget('hash.1', 'a'));
      assert(2 === ros.hlen('hash.1'));
    });

    it('Del non-exists field from hash', function () {
      assert(0 === ros.hdel('hash.1', 'd'));
      assert(3 === ros.hlen('hash.1'));
    });
  });

  describe('hgetall()', function () {
    it('Get all of exists hash', function () {
      assert({a: 1, b: 2, c: 3}.toString() === ros.hgetall('hash.1').toString());
    });

    it('Get all of non-exists hash', function () {
      assert({}.toString() === ros.hgetall('hash.3').toString());
    });
  });

  describe('hincrby()', function () {
    it('Increse exists field by 1', function () {
      assert(2 === ros.hincrby('hash.1', 'a', 1));
    });

    it('Increse non-exists field by 1', function () {
      assert(1 === ros.hincrby('hash.1', 'd', 1));
    });

    it('Increse non-integer field by 1', function () {
      assert(false === ros.hincrby('hash.2', 'c', 1));
    });
  });

  describe('hkeys()', function () {
    it('Get keys of exists hash', function () {
      assert(['a', 'b', 'c'].toString() === ros.hkeys('hash.1').toString());
    });

    it('Get keys of non-exists hash', function () {
      assert([].toString() === ros.hkeys('hash.3').toString());
    });
  });

  describe('hvals()', function () {
    it('Get values of exists hash', function () {
      assert([1, 2, 3].toString() === ros.hvals('hash.1').toString());
    });

    it('Get values of non-exists hash', function () {
      assert([].toString() === ros.hvals('hash.3').toString());
    });
  });

  describe('hmget()', function () {
    it('Multiple get fields of hash', function () {
      assert({a: 1, c: 3}.toString() === ros.hmget('hash.1', ['a', 'c']).toString());
    });

    it('Multiple get fields of non-exists hash', function () {
      assert({}.toString() === ros.hmget('hash.3', ['a', 'c']).toString());
    });
  });

  describe('hmset()', function () {
    it('Multiple set fields of hash', function () {
      assert(true === ros.hmset('hash.1', {a: 11, d: 4}));
      assert({a: 11, b: 2, c: 3, d: 4}.toString() === ros.hgetall('hash.1').toString());
    });

    it('Multiple set fields of non-exists hash', function () {
      assert(true === ros.hmset('hash.3', {a: 11, d: 4}));
      assert({a: 11, d: 4}.toString() === ros.hgetall('hash.3').toString());
    });
  });
});