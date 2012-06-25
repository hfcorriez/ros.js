describe('Base', function () {
    describe('dbsize()', function () {
        it('Get dbsize.', function () {
            assert(0 == rcache.dbsize());
            rcache.set('dbsize.1', '.');
            assert(1 == rcache.dbsize());
            rcache.set('dbsize.2', '.');
            rcache.set('dbsize.3', '.');
            assert(3 == rcache.dbsize());
        });
    });

    describe('flusall()', function () {
        it('Flush database.', function () {
            rcache.set('flushall.1', '.');
            assert('.' == rcache.get('flushall.1'));
            rcache.flushall();
            assert(0 == rcache.dbsize());
            assert(null == rcache.get('flushall.1'));
        });
    });

    describe('flusdb()', function () {
        it('Flush database.', function () {
            rcache.set('flusdb.1', '.');
            assert('.' == rcache.get('flusdb.1'));
            rcache.flushdb();
            assert(0 == rcache.dbsize());
            assert(null == rcache.get('flusdb.1'));
        });
    });
});