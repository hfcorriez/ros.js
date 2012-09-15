if (typeof module != 'undefined') {
  var ros = require('./../lib/ros')
    , assert = require('assert');
}

describe('Base', function () {
  describe('flusall()', function () {
    it('Flush database.', function () {
      ros.set('flushall.1', '.');
      assert('.' == ros.get('flushall.1'));
      ros.flushall();
      assert(0 == ros.dbsize());
      assert(false == ros.get('flushall.1'));
    });
  });

  describe('flusdb()', function () {
    it('Flush database.', function () {
      ros.set('flusdb.1', '.');
      assert('.' == ros.get('flusdb.1'));
      ros.flushdb();
      assert(0 == ros.dbsize());
      assert(false == ros.get('flusdb.1'));
    });
  });

  describe('dbsize()', function () {
    it('Get dbsize.', function () {
      assert(0 == ros.dbsize());
      ros.set('dbsize.1', '.');
      assert(1 == ros.dbsize());
      ros.set('dbsize.2', '.');
      ros.set('dbsize.3', '.');
      assert(3 == ros.dbsize());
    });
  });

  describe('exists()', function () {
    it('Check if exists a ', function () {
      ros.set('exists.1', '1k');
      assert(true === ros.exists('exists.1'));
    });
  });

  describe('del()', function () {
    it('Del a key', function () {
      ros.set('del.1', '1k');
      assert(true === ros.exists('del.1'));
      ros.del('del.1');
      assert(false === ros.exists('del.1'))
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