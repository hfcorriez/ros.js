describe('Base', function () {
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

    describe('flusall()', function () {
        it('Flush database.', function () {
            ros.set('flushall.1', '.');
            assert('.' == ros.get('flushall.1'));
            ros.flushall();
            assert(0 == ros.dbsize());
            assert(null == ros.get('flushall.1'));
        });
    });

    describe('flusdb()', function () {
        it('Flush database.', function () {
            ros.set('flusdb.1', '.');
            assert('.' == ros.get('flusdb.1'));
            ros.flushdb();
            assert(0 == ros.dbsize());
            assert(null == ros.get('flusdb.1'));
        });
    });
});