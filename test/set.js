describe('Set', function () {
  beforeEach(function () {
    ros.del('set.1');
    ros.del('set.2');
    ros.del('set.3');
    ros.sadd('set.1', 'a');
    ros.sadd('set.1', 'b');
    ros.sadd('set.1', 'c');
    ros.sadd('set.2', 'c');
    ros.sadd('set.2', 'd');
  });

  describe('sismember()', function () {
    it('Check if a member of set.', function () {
      assert(true === ros.sismember('set.2', 'c'));
    });

    it('Check if non-exist member of set.', function () {
      assert(false === ros.sismember('set.2', 'b'));
    });

    it('Check if non-exist member of wrong set.', function () {
      ros.set('set.sismember', 'test');
      assert(false === ros.smembers('set.sismember'))
    });
  });

  describe('smembers()', function () {
    it('Get members of set.', function () {
      assert(['c', 'd'].toString() === ros.smembers('set.2').toString())
    });

    it('Get members of non-exist set.', function () {
      assert([].toString() === ros.smembers('set.smembers').toString())
    });

    it('Get members of wrong set.', function () {
      ros.set('set.smembers', 'test');
      assert(false === ros.smembers('set.smembers'))
    });
  });

  describe('sadd()', function () {
    it('Add value to set', function () {
      assert(['c', 'd'].toString() === ros.smembers('set.2').toString());
    });

    it('Add value to illegal structure.', function () {
      ros.set('set.sadd1', '3');
      ros.sadd('set.sadd1', '4');
      assert('3' === ros.get('set.sadd1'));
      assert(false === ros.smembers('set.sadd1'))
    });

    it('Add object to set.', function () {
      var obj = {test: 'test'};
      ros.sadd('set.sadd2', obj);
      assert(true === ros.sismember('set.sadd2', obj));
      assert([obj].toString() === ros.smembers('set.sadd2').toString());
    });
  });

  describe('srem()', function () {
    it('Remove a member of set.', function () {
      assert(1 === ros.srem('set.2', 'c'));
      assert(['d'].toString() === ros.smembers('set.2').toString())
    });

    it('Remove non-exist member of set.', function () {
      assert(0 === ros.srem('set.2', 'b'));
    });

    it('Remove a value of non-exist set.', function () {
      assert(0 === ros.srem('set.srem', 'b'));
    });

    it('Remove a value of wrong set.', function () {
      ros.set('set.srem', 'test');
      assert(false === ros.srem('set.srem', 'b'));
    });
  });

  describe('spop()', function () {
    it('Pop a value of set.', function () {
      var smembers = ros.smembers('set.2');
      var f = ros.spop('set.2');
      var s = ros.spop('set.2');
      assert(smembers.contains(f));
      assert(smembers.contains(s));
      assert(false === ros.spop('set.2'));
    });

    it('Pop a value of non-exist set.', function () {
      assert(false === ros.spop('set.spop'));
    });

    it('Pop a value of wrong set.', function () {
      ros.set('set.spop', 'test');
      assert(false === ros.spop('set.spop'));
    });
  });

  describe('scard()', function () {
    it('Get length of set.', function () {
      assert(2 === ros.scard('set.2'));
      assert(3 === ros.scard('set.1'));
    });

    it('Get length of non-exist set.', function () {
      assert(0 === ros.scard('set.scard'));
    });

    it('Get length of wrong set.', function () {
      ros.set('set.scard', 'test');
      assert(false === ros.scard('set.scard'));
    });
  });

  describe('sinter()', function () {
    it('Get intersect of two set', function () {
      assert(["c"].toString() === ros.sinter('set.1', 'set.2').toString());
    });

    it('Get intersect of two set (the one is non-exist)', function () {
      assert([].toString() === ros.sinter('set.1', 'set.sinter').toString());
    });

    it('Get intersect of two set (the one is wrong type)', function () {
      ros.set('set.sinter', 'test');
      assert(false === ros.sinter('set.1', 'set.sinter'));
    });
  });

  describe('sinterstore()', function () {
    it('Store intersect of two set', function () {
      var ok = ros.sinterstore('sinterstore.3', 'set.1', 'set.2');
      assert(1 === ok);
      assert(['c'].toString() === ros.smembers('sinterstore.3').toString());
    });

    it('Store intersect with non-exist set', function () {
      var ok = ros.sinterstore('set.3', 'set.4', 'set.2');
      assert(0 === ok);
    });
  });

  describe('sunion()', function () {
    it('Get union of two set', function () {
      assert(["a", 'b', 'c', 'd'].toString() === ros.sunion('set.1', 'set.2').toString());
    });

    it('Get union of two set (the one is non-exist)', function () {
      assert(['a', 'b', 'c'].toString() === ros.sunion('set.1', 'set.sunion').toString());
    });

    it('Get union of two set (the one is wrong type)', function () {
      ros.set('set.sunion', 'test');
      assert(false === ros.sunion('set.1', 'set.sunion'));
    });
  });

  describe('sunionstore()', function () {
    it('Store union of two set', function () {
      var ok = ros.sunionstore('set.3', 'set.1', 'set.2');
      assert(4 === ok);
      assert(['a', 'b', 'c', 'd'].toString() === ros.smembers('set.3').toString());
    });

    it('Store union with non-exist set', function () {
      var ok = ros.sunionstore('set.3', 'set.4', 'set.2');
      assert(2 === ok);
    });
  });

  describe('sdiff()', function () {
    it('Get diff of two set', function () {
      assert(['a', 'b'].toString() === ros.sdiff('set.1', 'set.2').toString());
    });

    it('Get diff of two set (the one is non-exist)', function () {
      assert(['a', 'b', 'c'].toString() === ros.sdiff('set.1', 'set.sdiff').toString());
    });

    it('Get diff of two set (the one is wrong type)', function () {
      ros.set('set.sdiff', 'test');
      assert(false === ros.sdiff('set.1', 'set.sdiff'));
    });
  });

  describe('sdiffstore()', function () {
    it('Store diff of two set', function () {
      var ok = ros.sdiffstore('set.3', 'set.1', 'set.2');
      assert(2 === ok);
      assert(['a', 'b'].toString() === ros.smembers('set.3').toString());
    });

    it('Store diff with non-exist set', function () {
      var ok = ros.sdiffstore('set.3', 'set.4', 'set.2');
      assert(0 === ok);
      var ok2 = ros.sdiffstore('set.3', 'set.1', 'set.4');
      assert(3 === ok2);
    });
  });

  describe('smove()', function () {
    it('Move exist different value', function () {
      var ok = ros.smove('set.1', 'set.2', 'a');
      assert(1 === ok);
      assert(['b', 'c'].toString() === ros.smembers('set.1').toString());
      assert(['c', 'd', 'a'].toString() === ros.smembers('set.2').toString());
    });

    it('Move exist same value', function () {
      var ok = ros.smove('set.1', 'set.2', 'c');
      assert(1 === ok);
      assert(['a', 'b'].toString() === ros.smembers('set.1').toString());
      assert(['c', 'd'].toString() === ros.smembers('set.2').toString());
    });

    it('Move non-exist value', function () {
      var ok = ros.smove('set.1', 'set.2', 'e');
      assert(0 === ok);
      assert(['a', 'b', 'c'].toString() === ros.smembers('set.1').toString());
      assert(['c', 'd'].toString() === ros.smembers('set.2').toString());
    });

    it('Move to wrong set', function () {
      var ok = ros.smove('set.1', 'set.smove', 'e');
      assert(0 === ok);
    });
  });

  describe('srandmember()', function () {
    it('Get random member of set', function () {
      var r = ros.srandmember('set.1');
      assert(true === ros.smembers('set.1').contains(r));
    });
  });
});