describe('Set', function () {
    beforeEach(function () {
        rcache.sadd('set.1', 'a');
        rcache.sadd('set.1', 'b');
        rcache.sadd('set.1', 'c');
        rcache.sadd('set.2', 'c');
        rcache.sadd('set.2', 'd');
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