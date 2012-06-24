describe('Key', function () {
    describe('set()', function () {
        it('Set a value', function () {
            var ok = rcache.set('key.1', 'a value.');
            assert('a value.' == rcache.get('key.1'));
            assert(ok == true);
        });

        it('Set a object.', function () {
            var obj = {test:'test'};
            var ok = rcache.set('key.2', obj);
            assert(obj == rcache.get('key.2'));
            assert(ok == true);
        });
    });

    describe('setnx()', function () {
        it('Setnx if exist.', function () {
            // 存在测试
            rcache.set('key.3', 'k3');
            var ok = rcache.setnx('key.3', 'k3 nx');
            assert(ok == false);
            assert('k3' == rcache.get('key.3'));
        });

        it('Setnx if not exist.', function () {
            // 不存在测试
            var ok2 = rcache.setnx('key.4', 'k4 nx');
            assert(ok2 == true);
            assert('k4 nx' == rcache.get('key.4'));
        });
    });

    describe('exist()', function () {
        it('Check if exist a key.', function () {
            rcache.set('key.5', 'k5');
            assert(true == rcache.exists('key.5'));
        });
    });

    describe('del()', function () {
        it('Del a key.', function () {
            rcache.set('key.6', 'k6');
            assert(true == rcache.exists('key.6'));
            rcache.del('key.6');
            assert(false == rcache.exists('key.6'))
        });
    });

    describe('incr()', function () {
        it('Incr a non-exist key.', function () {
            // 不存在情况
            var s1 = rcache.incr('key.7');
            assert(1 == rcache.get('key.7'));
            assert(1 == s1);
        });

        it('Incr a exist key with not number string.', function () {
            // 非数字字符串情况下
            rcache.set('key.8', 'k8');
            var s2 = rcache.incr('key.8');
            assert(false == s2);
            assert('k8' == rcache.get('key.8'));
        });

        it('Incr a exist key with number string.', function () {
            // 数字字符串情况
            rcache.set('key.9', '9');
            rcache.incr('key.9');
            assert(10 == rcache.get('key.9'));
        });
    });

    describe('decr()', function () {
        it('Decr a non-exist key.', function () {
            // 不存在情况下
            var s1 = rcache.decr('key.10');
            assert(-1 == rcache.get('key.10'));
            assert(-1 == s1);
        });

        it('Decr a exist key with not number string.', function () {
            // 非数字字符串情况
            rcache.set('key.11', 'k11');
            var s2 = rcache.decr('key.11');
            assert(false == s2);
            assert('k11' == rcache.get('key.11'));
        });

        it('Decr a exist key with number string.', function () {
            // 数字字符串情况
            rcache.set('key.12', '12');
            rcache.decr('key.12');
            assert(11 == rcache.get('key.12'));
        });
    });

    describe('getset()', function () {
        it('Get and set a non-exist key.', function () {
            // 不存在的情况下
            var old = rcache.getset('key.13', 'k13');
            assert(null == old);
            assert('k13' == rcache.get('key.13'));
        });

        it('Get and set a exist key.', function () {
            // 存在情况下
            var old1 = rcache.getset('key.13', 'k13.');
            assert('k13' == old1);
            assert('k13.' == rcache.get('key.13'));
        });
    });

    describe('append()', function () {
        it('Append normal.', function () {
            // 字符串拼接
            rcache.set('key.14', 'k14');
            var len1 = rcache.append('key.14', 'too');
            assert('k14too' == rcache.get('key.14'));
            assert('k14too'.length = len1);
        });

        it('Append a non-exist key.', function () {
            // 不存在情况
            rcache.del('key.14');
            var len = rcache.append('key.14', 'k14');
            assert('k14' == rcache.get('key.14'));
            assert(len == 'k14'.length);
        });

        it('Append a key with integer value.', function () {
            // 整形拼接
            rcache.set('key.14', 1);
            rcache.append('key.14', 2);
            assert('12' == rcache.get('key.14'));
        });

        it('Append other type of data.', function () {
            // 不支持其他数据类型
            rcache.append('key.14', ['c', 'd']);
            assert('12' == rcache.get('key.14'));
        });
    });
});