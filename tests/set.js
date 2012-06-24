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
            assert(true === rcache.sismember('set.2', 'c'));
        });

        it('Check if non-exist member of set.', function () {
            assert(false === rcache.sismember('set.2', 'b'));
        });

        it('Check if non-exist member of wrong set.', function () {
            rcache.set('set.sismember', 'test');
            assert(false === rcache.smembers('set.sismember'))
        });
    });

    describe('smembers()', function () {
        it('Get members of set.', function () {
            assert(['c', 'd'].toString() === rcache.smembers('set.2').toString())
        });

        it('Get members of non-exist set.', function () {
            assert([].toString() === rcache.smembers('set.smembers').toString())
        });

        it('Get members of wrong set.', function () {
            rcache.set('set.smembers', 'test');
            assert(false === rcache.smembers('set.smembers'))
        });
    });

    describe('sadd()', function () {
        it('Add value to set', function () {
            assert(['c', 'd'].toString() === rcache.smembers('set.2').toString());
        });

        it('Add value to illegal structure.', function () {
            rcache.set('set.3', '3');
            rcache.sadd('set.3', '4');
            assert('3' === rcache.get('set.3'));
            assert(false === rcache.smembers('set.3'))
        });

        it('Add object to set.', function () {
            var obj = {test: 'test'};
            rcache.sadd('set.2', obj);
            assert(true === rcache.sismember('set.2', obj));
            assert(['c', 'd', obj].toString() === rcache.smembers('set.2').toString());
        });
    });

    describe('srem()', function () {
        it('Remove a member of set.', function () {
            assert(true === rcache.srem('set.2', 'c'));
            assert(['d'].toString() === rcache.smembers('set.2').toString())
        });

        it('Remove non-exist member of set.', function () {
            assert(false === rcache.srem('set.2', 'b'));
        });

        it('Remove a value of non-exist set.', function () {
            assert(false === rcache.srem('set.srem', 'b'));
        });

        it('Remove a value of wrong set.', function () {
            rcache.set('set.srem', 'test');
            assert(false === rcache.srem('set.srem', 'b'));
        });
    });

    describe('spop()', function () {
        it('Pop a value of set.', function () {
            assert('d' === rcache.spop('set.2'));
            assert(['c'].toString() === rcache.smembers('set.2').toString());
            assert('c' === rcache.spop('set.2'));
            assert(null === rcache.spop('set.2'))
        });

        it('Pop a value of non-exist set.', function () {
            assert(null === rcache.spop('set.spop'));
        });

        it('Pop a value of wrong set.', function () {
            rcache.set('set.spop', 'test');
            assert(false === rcache.spop('set.spop'));
        });
    });

    describe('scard()', function () {
        it('Get length of set.', function () {
            assert(2 === rcache.scard('set.2'));
            assert(3 === rcache.scard('set.1'));
        });

        it('Get length of non-exist set.', function () {
            assert(0 === rcache.scard('set.scard'));
        });

        it('Get length of wrong set.', function () {
            rcache.set('set.scard', 'test');
            assert(false === rcache.scard('set.scard'));
        });
    });

    describe('sinter()', function () {
        it('Get intersect of two set', function () {
            assert(["c"].toString() === rcache.sinter('set.1', 'set.2').toString());
        });

        it('Get intersect of two set (the one is non-exist)', function () {
            assert([].toString() === rcache.sinter('set.1', 'set.sinter').toString());
        });

        it('Get intersect of two set (the one is wrong type)', function () {
            rcache.set('set.sinter', 'test');
            assert(false === rcache.sinter('set.1', 'set.sinter'));
        });
    });

    describe('sinterstore()', function () {
        it('Store intersect of two set', function () {
            var ok = rcache.sinterstore('set.3', 'set.1', 'set.2');
            assert(1 === ok);
            assert(['c'].toString() === rcache.smembers('set.3').toString());
        });

        it('Store intersect with non-exist set', function () {
            var ok = rcache.sinterstore('set.3', 'set.4', 'set.2');
            assert(0 === ok);
        });
    });

    describe('sunion()', function () {
        it('Get union of two set', function () {
            assert(["a", 'b', 'c', 'd'].toString() === rcache.sunion('set.1', 'set.2').toString());
        });

        it('Get union of two set (the one is non-exist)', function () {
            assert(['a', 'b', 'c'].toString() === rcache.sunion('set.1', 'set.sunion').toString());
        });

        it('Get union of two set (the one is wrong type)', function () {
            rcache.set('set.sunion', 'test');
            assert(false === rcache.sunion('set.1', 'set.sunion'));
        });
    });

    describe('sunionstore()', function () {
        it('Store union of two set', function () {
            var ok = rcache.sunionstore('set.3', 'set.1', 'set.2');
            assert(4 === ok);
            assert(['a', 'b', 'c', 'd'].toString() === rcache.smembers('set.3').toString());
        });

        it('Store union with non-exist set', function () {
            var ok = rcache.sunionstore('set.3', 'set.4', 'set.2');
            assert(2 === ok);
        });
    });

    describe('sdiff()', function () {
        it('Get diff of two set', function () {
            assert(['a', 'b'].toString() === rcache.sdiff('set.1', 'set.2').toString());
        });

        it('Get diff of two set (the one is non-exist)', function () {
            assert(['a', 'b', 'c'].toString() === rcache.sdiff('set.1', 'set.sdiff').toString());
        });

        it('Get diff of two set (the one is wrong type)', function () {
            rcache.set('set.sdiff', 'test');
            assert(false === rcache.sdiff('set.1', 'set.sdiff'));
        });
    });

    describe('sdiffstore()', function () {
        it('Store diff of two set', function () {
            var ok = rcache.sdiffstore('set.3', 'set.1', 'set.2');
            assert(2 === ok);
            assert(['a', 'b'].toString() === rcache.smembers('set.3').toString());
        });

        it('Store diff with non-exist set', function () {
            var ok = rcache.sdiffstore('set.3', 'set.4', 'set.2');
            assert(0 === ok);
            var ok2 = rcache.sdiffstore('set.3', 'set.1', 'set.4');
            assert(3 === ok2);
        });
    });

    describe('smove()', function () {
        it('Move exist different value', function () {
            var ok = rcache.smove('set.1', 'set.2', 'a');
            assert(true === ok);
            assert(['b', 'c'].toString() === rcache.smembers('set.1').toString());
            assert(['c', 'd', 'a'].toString() === rcache.smembers('set.2').toString());
        });

        it('Move exist same value', function () {
            var ok = rcache.smove('set.1', 'set.2', 'c');
            assert(true === ok);
            assert(['a', 'b'].toString() === rcache.smembers('set.1').toString());
            assert(['c', 'd'].toString() === rcache.smembers('set.2').toString());
        });

        it('Move non-exist value', function () {
            var ok = rcache.smove('set.1', 'set.2', 'e');
            assert(false === ok);
            assert(['a', 'b', 'c'].toString() === rcache.smembers('set.1').toString());
            assert(['c', 'd'].toString() === rcache.smembers('set.2').toString());
        });

        it('Move to wrong set', function () {
            var ok = rcache.smove('set.1', 'set.smove', 'e');
            assert(false === ok);
        });
    });

    describe('srandmember()', function () {
        it('Get random member of set', function () {
            var r = rcache.srandmember('set.1');
            assert(true === rcache.smembers('set.1').contains(r));
        });
    });
});