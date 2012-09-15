describe('Key', function () {
  describe('set()', function () {
    it('Set a value', function () {
      var ok = ros.set('set.1', '1k');
      assert('1k' === ros.get('set.1'));
      assert(ok === true);
    });
  });

  describe('setnx()', function () {
    it('Setnx if exist.', function () {
      // 存在测试
      ros.set('setnx.1', '1k');
      var ok = ros.setnx('setnx.1', '1k.');
      assert(ok === false);
      assert('1k' === ros.get('setnx.1'));
    });

    it('Setnx if not exist.', function () {
      // 不存在测试
      var ok2 = ros.setnx('setnx.2', '2k');
      assert(ok2 === true);
      assert('2k' === ros.get('setnx.2'));
    });
  });

  describe('exists()', function () {
    it('Check if exists a ', function () {
      ros.set('exists.1', '1k');
      assert(true === ros.exists('exists.1'));
    });
  });

  describe('del()', function () {
    it('Del a ', function () {
      ros.set('del.1', '1k');
      assert(true === ros.exists('del.1'));
      ros.del('del.1');
      assert(false === ros.exists('del.1'))
    });
  });

  describe('incr()', function () {
    it('Incr a non-exist ', function () {
      // 不存在情况
      var s1 = ros.incr('incr.1');
      assert(1 === ros.get('incr.1'));
      assert(1 === s1);
    });

    it('Incr a exist key with not number string.', function () {
      // 非数字字符串情况下
      ros.set('incr.2', '2k');
      var s2 = ros.incr('incr.2');
      assert(false === s2);
      assert('2k' === ros.get('incr.2'));
    });

    it('Incr a exist key with number string.', function () {
      // 数字字符串情况
      ros.set('incr.3', '3');
      var s3 = ros.incr('incr.3');
      assert(4 === ros.get('incr.3'));
    });
  });

  describe('decr()', function () {
    it('Decr a non-exist ', function () {
      // 不存在情况下
      var s1 = ros.decr('decr.1');
      assert(-1 === ros.get('decr.1'));
      assert(-1 === s1);
    });

    it('Decr a exist key with not number string.', function () {
      // 非数字字符串情况
      ros.set('decr.2', 'k2');
      var s2 = ros.decr('decr.2');
      assert(false === s2);
      assert('k2' === ros.get('decr.2'));
    });

    it('Decr a exist key with number string.', function () {
      // 数字字符串情况
      ros.set('decr.3', '3');
      ros.decr('decr.3');
      assert(2 === ros.get('decr.3'));
    });
  });

  describe('getset()', function () {
    it('Get and set a non-exist ', function () {
      // 不存在的情况下
      var old = ros.getset('getset.1', '1k');
      assert(false === old);
      assert('1k' === ros.get('getset.1'));
    });

    it('Get and set a exist ', function () {
      // 存在情况下
      ros.set('getset.2', '2k');
      var old1 = ros.getset('getset.2', '2k.');
      assert('2k' === old1);
      assert('2k.' === ros.get('getset.2'));
    });
  });

  describe('append()', function () {
    it('Append normal.', function () {
      // 字符串拼接
      ros.set('append.1', '1.');
      var len1 = ros.append('append.1', '.');
      assert('1..' === ros.get('append.1'));
      assert('1..'.length = len1);
    });

    it('Append a non-exist ', function () {
      // 不存在情况
      ros.del('append.2');
      var len = ros.append('append.2', '2k');
      assert('2k' === ros.get('append.2'));
      assert(len === '2k'.length);
    });

    it('Append a key with integer value.', function () {
      // 整形拼接
      ros.set('append.3', 3);
      ros.append('append.3', 3);
      assert('33' === ros.get('append.3'));
    });

    it('Append other type of data.', function () {
      // 不支持其他数据类型
      ros.append('append.4', ['c', 'd']);
      assert(false === ros.get('append.4'));
    });
  });

  describe('keys()', function () {
    it('Get keys with nothing.', function () {
      var keys = ros.keys('adfasdfsdf*');
      assert(keys.toString() === [].toString());
    });

    it('Get keys normal.', function () {
      ros.set('keys.1', '1');
      ros.set('keys.2', '2');
      ros.set('keys.3', '3');
      var keys = ros.keys('keys.*');
      assert(['keys.1', 'keys.2', 'keys.3'].toString() === keys.toString());
    });

    it('Get keys with *.', function () {
      ros.flushall();
      ros.set('keys.1', '1');
      ros.set('abc', '2');
      ros.set('test', '3');
      var keys = ros.keys('*');
      assert(['keys.1', 'abc', 'test'].toString() === keys.toString());
    });
  });

  describe('rename()', function () {
    it('Rename exist ', function () {
      ros.set('rename.1', 'k');
      assert('k' === ros.get('rename.1'));
      assert(false === ros.get('rename.2'));
      ros.rename('rename.1', 'rename.2');
      assert(false === ros.get('rename.1'));
      assert('k' === ros.get('rename.2'));
    });

    it('Rename non-exist ', function () {
      var ok = ros.rename('rename.3', 'rename.4');
      assert(false === ok);
      assert(false === ros.get('rename.3'));
      assert(false === ros.get('rename.4'))
    });
  });

  describe('renamenx()', function () {
    it('Rename exist key and non-exist new ', function () {
      ros.set('renamenx.1', 'k');
      assert('k' === ros.get('renamenx.1'));
      assert(false === ros.get('renamenx.2'));
      ros.renamenx('renamenx.1', 'renamenx.2');
      assert(false === ros.get('renamenx.1'));
      assert('k' === ros.get('renamenx.2'));
    });

    it('Rename non-exist key and new ', function () {
      var ok = ros.renamenx('renamenx.3', 'renamenx.4');
      assert(false === ok);
      assert(false === ros.get('renamenx.3'));
      assert(false === ros.get('renamenx.4'))
    });

    it('Rename exist key and new ', function () {
      ros.set('renamenx.3', '3');
      ros.set('renamenx.4', '4');
      var ok = ros.renamenx('renamenx.3', 'renamenx.4');
      assert(false === ok);
      assert('3' === ros.get('renamenx.3'));
      assert('4' === ros.get('renamenx.4'))
    });
  });

  describe('randomkey()', function () {
    it('Get random ', function () {
      ros.set('random1', 'k');
      var key = ros.randomkey();
      assert(!!ros.get(key));
    });
  });
});