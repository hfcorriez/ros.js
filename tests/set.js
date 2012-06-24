describe('Set', function () {
    beforeEach(function () {
        rcache.del('set.1');
        rcache.del('set.2');
        rcache.sadd('set.1', 'a');
        rcache.sadd('set.1', 'b');
        rcache.sadd('set.1', 'c');
        rcache.sadd('set.2', 'c');
        rcache.sadd('set.2', 'd');
    });

    describe('sismember()', function () {
        it('Check if a member of set.', function () {
            assert(true == rcache.sismember('set.2', 'c'));
        });

        it('Check if non-exist member of set.', function () {
            assert(false == rcache.sismember('set.2', 'b'));
        });
    });

    describe('smembers()', function () {
        it('Get members of set.', function () {
            assert(['c', 'd'].toString() == rcache.smembers('set.2').toString())
        });
    });

    describe('sadd()', function () {
        it('Add value to set', function () {
            assert(['c', 'd'].toString() == rcache.smembers('set.2'));
        });

        it('Add value to illegal structure.', function () {
            rcache.set('set.3', '3');
            rcache.sadd('set.3', '4');
            assert('3' == rcache.get('set.3'));
            assert(false == rcache.smembers('set.3'))
        });
    });

    describe('srem()', function () {
        it('Remove a member of set.', function () {
            assert(true == rcache.srem('set.2', 'c'));
            assert(['d'].toString() == rcache.smembers('set.2').toString())
        });

        it('Remove non-exist member of set.', function () {
            assert(false == rcache.srem('set.2', 'b'));
        });
    });

    describe('spop()', function () {
        it('Pop a member of set.', function () {
            assert('d' == rcache.spop('set.2'));
            assert(['c'].toString() == rcache.smembers('set.2').toString());
            assert('c' == rcache.spop('set.2'));
            assert(null == rcache.spop('set.2'))
        });
    });

    describe('scard()', function () {
        it('Get length of set.', function () {
            assert(2 == rcache.scard('set.2'));
            assert(3 == rcache.scard('set.1'));
        });
    });

    describe('sinter()', function () {
        it('Get intersect of two array', function () {
            assert(["c"].toString() == rcache.sinter('set.1', 'set.2').toString());
        });
    });

    describe('sunion()', function () {
        it('Get union of two array', function () {
            assert(["a", 'b', 'c', 'd'].toString() == rcache.sunion('set.1', 'set.2').toString());
        });
    });

    describe('sdiff()', function () {
        it('Get diff of two array', function () {
            assert(['a', 'b'].toString() == rcache.sdiff('set.1', 'set.2').toString());
        });
    });
});