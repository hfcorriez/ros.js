describe('Key', function () {
    describe('set()', function () {
        it('Set a value', function () {
            var ok = rcache.set('set.1', '1k');
            assert('1k' === rcache.get('set.1'));
            assert(ok === true);
        });

        it('Set a object.', function () {
            var obj = {test:'test'};
            var ok = rcache.set('set.2', obj);
            assert(obj === rcache.get('set.2'));
            assert(ok === true);
        });
    });

    describe('setnx()', function () {
        it('Setnx if exist.', function () {
            // 存在测试
            rcache.set('setnx.1', '1k');
            var ok = rcache.setnx('setnx.1', '1k.');
            assert(ok === false);
            assert('1k' === rcache.get('setnx.1'));
        });

        it('Setnx if not exist.', function () {
            // 不存在测试
            var ok2 = rcache.setnx('setnx.2', '2k');
            assert(ok2 === true);
            assert('2k' === rcache.get('setnx.2'));
        });
    });

    describe('exists()', function () {
        it('Check if exists a ', function () {
            rcache.set('exists.1', '1k');
            assert(true === rcache.exists('exists.1'));
        });
    });

    describe('del()', function () {
        it('Del a ', function () {
            rcache.set('del.1', '1k');
            assert(true === rcache.exists('del.1'));
            rcache.del('del.1');
            assert(false === rcache.exists('del.1'))
        });
    });

    describe('incr()', function () {
        it('Incr a non-exist ', function () {
            // 不存在情况
            var s1 = rcache.incr('incr.1');
            assert(1 === rcache.get('incr.1'));
            assert(1 === s1);
        });

        it('Incr a exist key with not number string.', function () {
            // 非数字字符串情况下
            rcache.set('incr.2', '2k');
            var s2 = rcache.incr('incr.2');
            assert(false === s2);
            assert('2k' === rcache.get('incr.2'));
        });

        it('Incr a exist key with number string.', function () {
            // 数字字符串情况
            rcache.set('incr.3', '3');
            rcache.incr('incr.3');
            assert(4 === rcache.get('incr.3'));
        });
    });

    describe('decr()', function () {
        it('Decr a non-exist ', function () {
            // 不存在情况下
            var s1 = rcache.decr('decr.1');
            assert(-1 === rcache.get('decr.1'));
            assert(-1 === s1);
        });

        it('Decr a exist key with not number string.', function () {
            // 非数字字符串情况
            rcache.set('decr.2', 'k2');
            var s2 = rcache.decr('decr.2');
            assert(false === s2);
            assert('k2' === rcache.get('decr.2'));
        });

        it('Decr a exist key with number string.', function () {
            // 数字字符串情况
            rcache.set('decr.3', '3');
            rcache.decr('decr.3');
            assert(2 === rcache.get('decr.3'));
        });
    });

    describe('getset()', function () {
        it('Get and set a non-exist ', function () {
            // 不存在的情况下
            var old = rcache.getset('getset.1', '1k');
            assert(null === old);
            assert('1k' === rcache.get('getset.1'));
        });

        it('Get and set a exist ', function () {
            // 存在情况下
            rcache.set('getset.2', '2k');
            var old1 = rcache.getset('getset.2', '2k.');
            assert('2k' === old1);
            assert('2k.' === rcache.get('getset.2'));
        });
    });

    describe('append()', function () {
        it('Append normal.', function () {
            // 字符串拼接
            rcache.set('append.1', '1.');
            var len1 = rcache.append('append.1', '.');
            assert('1..' === rcache.get('append.1'));
            assert('1..'.length = len1);
        });

        it('Append a non-exist ', function () {
            // 不存在情况
            rcache.del('append.2');
            var len = rcache.append('append.2', '2k');
            assert('2k' === rcache.get('append.2'));
            assert(len === '2k'.length);
        });

        it('Append a key with integer value.', function () {
            // 整形拼接
            rcache.set('append.3', 3);
            rcache.append('append.3', 3);
            assert('33' === rcache.get('append.3'));
        });

        it('Append other type of data.', function () {
            // 不支持其他数据类型
            rcache.append('append.4', ['c', 'd']);
            assert(null === rcache.get('append.4'));
        });
    });

    describe('keys()', function () {
        it('Get keys with nothing.', function () {
            var keys = rcache.keys('adfasdfsdf*');
            assert(keys.toString() === [].toString());
        });

        it('Get keys normal.', function () {
            rcache.set('keys.1', '1');
            rcache.set('keys.2', '2');
            rcache.set('keys.3', '3');
            var keys = rcache.keys('keys.*');
            assert(['keys.1', 'keys.2', 'keys.3'].toString() === keys.toString());
        });

        it('Get keys with *.', function () {
            rcache.flushall();
            rcache.set('keys.1', '1');
            rcache.set('abc', '2');
            rcache.set('test', '3');
            var keys = rcache.keys('*');
            assert(['keys.1', 'abc', 'test'].toString() === keys.toString());
        });
    });

    describe('rename()', function () {
        it('Rename exist ', function () {
            rcache.set('rename.1', 'k');
            assert('k' === rcache.get('rename.1'));
            assert(null === rcache.get('rename.2'));
            rcache.rename('rename.1', 'rename.2');
            assert(null === rcache.get('rename.1'));
            assert('k' === rcache.get('rename.2'));
        });

        it('Rename non-exist ', function () {
            var ok = rcache.rename('rename.3', 'rename.4');
            assert(false === ok);
            assert(null === rcache.get('rename.3'));
            assert(null === rcache.get('rename.4'))
        });
    });

    describe('renamenx()', function () {
        it('Rename exist key and non-exist new ', function () {
            rcache.set('renamenx.1', 'k');
            assert('k' === rcache.get('renamenx.1'));
            assert(null === rcache.get('renamenx.2'));
            rcache.renamenx('renamenx.1', 'renamenx.2');
            assert(null === rcache.get('renamenx.1'));
            assert('k' === rcache.get('renamenx.2'));
        });

        it('Rename non-exist key and new ', function () {
            var ok = rcache.renamenx('renamenx.3', 'renamenx.4');
            assert(false === ok);
            assert(null === rcache.get('renamenx.3'));
            assert(null === rcache.get('renamenx.4'))
        });

        it('Rename exist key and new ', function () {
            rcache.set('renamenx.3', '3');
            rcache.set('renamenx.4', '4');
            var ok = rcache.renamenx('renamenx.3', 'renamenx.4');
            assert(false === ok);
            assert('3' === rcache.get('renamenx.3'));
            assert('4' === rcache.get('renamenx.4'))
        });
    });

    describe('randomkey()', function () {
        it('Get random ', function () {
            rcache.set('random1', 'k');
            var key = rcache.randomkey();
            assert(!!rcache.get(key));
        });
    });
});