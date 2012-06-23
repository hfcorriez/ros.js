/*
 * rcache.js
 * version: 0.2
 *
 * Licensed under the MIT:
 *   http://www.opensource.org/licenses/mit-license.php
 */

;(function() {
    /**
     * Extend each method of Array
     * @param fn
     * @return {Array}
     */
    Array.prototype.each = function(fn){
        fn = fn || Function.K;
        var a = [];
        var args = Array.prototype.slice.call(arguments, 1);
        for(var i = 0; i < this.length; i++){
            var res = fn.apply(this,[this[i],i].concat(args));
            if(res != null) a.push(res);
        }
        return a;
    };

    /**
     * Extend unique method of Array
     * @return {Array}
     */
    Array.prototype.uniquelize = function(){
        var ra = new Array();
        for(var i = 0; i < this.length; i ++){
            if(!ra.contains(this[i])){
                ra.push(this[i]);
            }
        }
        return ra;
    };

    /**
     * Extent contains method of Array
     * @param item
     * @return {Boolean}
     */
    Array.prototype.contains = function(item){
        return RegExp(item).test(this);
    };

    // Storage of data
    var data = {};

    // Meta of data
    var meta = {};

    /*
     * Base
     */

    /**
     * Exist a key?
     * @param key
     * @return {Boolean}
     */
    this.exists = function (key) {
        return data.hasOwnProperty(key);
    };

    /**
     * 获取键值
     *
     * @param key
     * @todo 考虑将默认值去掉，完全按照redis api设计
     */
    this.get = function (key) {
        return this.exists(key) ? data[key] : null;
    };

    /**
     * 存储键值对
     *
     * @param key
     * @param value
     */
    this.set = function (key, value) {
        data[key] = value;
        this._save(key, value);
        return true;
    };

    /**
     * 删除
     *
     * @param key
     */
    this.del = function (key) {
        return delete data[key];
    };

    /**
     * 将一个key递增1
     *
     * @param key
     */
    this.incr = function (key) {
        return this.incrby(key, 1);
    };

    /**
     * 将一个key按照count递增
     *
     * @param key
     * @param count
     * @returns {Boolean}
     */
    this.incrby = function (key, count) {
        if (!this._isNumber(count)) return false;
        if (!this.exists(key)) return (this.set(key, count), count);
        if (this._meta(key) == 'number') return (data[key] = parseInt(data[key]) + parseInt(count), data[key]);
        return false;
    };

    /**
     * 将一个key递减1
     *
     * @param key
     * @returns {Boolean}
     */
    this.decr = function (key) {
        return this.decrby(key, 1);
    };

    /**
     * 将一个key按照count递减
     *
     * @param key
     * @param count
     * @returns {Boolean}
     */
    this.decrby = function (key, count) {
        if (!this._isNumber(count)) return false;
        if (!this.exists(key)) return (this.set(key, -count), -count);
        if (this._meta(key) == 'number') return (data[key] = parseInt(data[key]) - parseInt(count), data[key]);
        return false;
    };

    /**
     * 存储一个key，并返回存储前的key值
     *
     * @param key
     * @param value
     * @returns {*||Boolean}
     */
    this.getset = function (key, value) {
        var older = this.exists(key) ? this.get(key) : 0;
        this.set(key, value);
        return older;
    };

    /**
     * 当key不存在的时候存储
     *
     * @param key
     * @param value
     * @returns {Boolean}
     */
    this.setnx = function (key, value) {
        return this.exists(key) ? false : (this.set(key, value), true);
    };

    /**
     * 将一个key值append字符串
     *
     * @param key
     * @param value
     * @returns {Boolean}
     */
    this.append = function (key, value) {
        value = this._toString(value);
        if (!value) return false;

        if (!this.exists(key)) this.set(key, value);
        else data[key] += value;
        return data[key].length;
    };

    /*
     * Set
     */

    /**
     * 返回一个元素在集合中的索引
     *
     * @param key
     * @param value
     * @returns {Number}
     */
    this._sindex = function (key, value) {
        for (var i in data[key]) if (data[key][i] == value ) return i;
        return -1;
    };

    /**
     * 检查一个元素是否属于一个集合
     *
     * @param key
     * @param value
     * @returns {Boolean}
     */
    this.sismember = function (key, value) {
        if (!this._isSet(key)) return false;

        return !!(this._sindex(key, value) > -1);
    };

    /**
     * 将一个元素添加到一个集合
     *
     * @param key
     * @param value
     * @returns {Boolean}
     */
    this.sadd = function (key, value) {
        !this.exists(key) && this.set(key, []);
        !this.sismember(key, value) && data[key].push(value);
        return true;
    };

    /**
     * 将一个元素从集合中删除
     *
     * @param key
     * @param value
     * @returns {Boolean}
     */
    this.srem = function (key, value) {
        if (!this._isSet(key)) return false;

        var index = this._sindex(key, value);
        return index > -1 ? data[key].splice(index, index + 1) : 0;
    };

    /**
     * 将集合中最后一个元素抛出
     *
     * @param key
     * @param value
     * @returns {*}
     */
    this.spop = function (key, value) {
        if (!this._isSet(key)) return false;

        return data[key].pop();
    };

    /**
     * 返回集合的长度
     *
     * @param key
     * @returns {Number}
     */
    this.scard = function (key) {
        if (!this._isSet(key)) return 0;

        return data[key].length;
    };

    /**
     * 将一个元素从key1集合移动到key2集合
     *
     * @param key1
     * @param key2
     * @param value
     * @returns {Boolean}
     */
    this.smove = function (key1, key2, value) {
        if (!this._isSet(key)) return false;

        this.srem(key1, value);
        this.sadd(key2, value);
        return true;
    };

    /**
     * 返回集合中的所有元素
     *
     * @param key
     * @returns {Object}
     */
    this.smembers = function (key) {
        if (!this._isSet(key)) return false;

        return data[key];
    };

    /**
     * 获取两个集合的交集
     *
     * @param key1
     * @param key2
     */
    this.sinter = function (key1, key2) {
        if (!this._isSet(key1) || !this._isSet(key2)) return false;

        return data[key1].each(function(o){return data[key2].contains(o) ? o : null});
    };

    /**
     * 返回两个集合的并集
     *
     * @param key1
     * @param key2
     */
    this.sunion = function (key1, key2) {
        if (!this._isSet(key1) || !this._isSet(key2)) return false;

        return data[key1].concat(data[key2]).uniquelize();
    };

    /**
     * 返回两个集合的差集
     *
     * @param key1
     * @param key2
     */
    this.sdiff = function (key1, key2) {
        if (!this._isSet(key1) || !this._isSet(key2)) return false;

        return data[key1].each(function(o){return data[key2].contains(o) ? null : o});
    };

    /**
     * 随机返回集合中的一个元素
     *
     * @param key
     */
    this.srandmember = function (key) {
        if (!this._isSet(key)) return false;

        var set = data[key],
            length = set.length - 1,
            random = (Math.random() * length).toFixed(0);
        return set[random];
    };

    /*
     * Hash
     */

    /**
     * 检查field是否在hash中存在
     *
     * @param key
     * @param field
     */
    this.hexists = function (key, field) {
        return typeof data[key][field] != 'undefined';
    };

    /**
     * 返回hash中的一个字段
     * @param key
     * @param field
     * @param d
     * @returns
     * @todo 可能会将默认值去掉保持和redis api一致
     */
    this.hget = function (key, field, d) {
        if (!this.hexists(key, field)) return d;

        return data[key][field];
    };

    /**
     * 在hash中设置字段
     *
     * @param key
     * @param field
     * @param value
     * @returns {Boolean}
     */
    this.hset = function (key, field, value) {
        if (!this.exists(key)) data[key] = {};

        data[key][field] = value;
        return true;
    };

    /**
     * 返回hash表的长度
     *
     * @param key
     * @returns {Number}
     */
    this.hlen = function (key) {
        if (!this.exists(key)) return 0;

        var len = 0;
        for (i in data[key]) len++;

        return len;
    };

    /**
     * 删除hash中的一个字段
     *
     * @param key
     * @param field
     * @returns
     */
    this.hdel = function (key, field) {
        return delete data[key][field];
    };

    /**
     * 获取hash表
     *
     * @param key
     * @returns
     */
    this.hgetall = function (key) {
        return this.get(key);
    };

    /**
     * 将hash的一个字段按照给定数值递增
     *
     * @param key
     * @param field
     * @param count
     * @returns {Boolean}
     */
    this.hincrby = function (key, field, count) {
        if (typeof count == 'undefined') count = 1;

        if (!this.hget(key, field)) data[key][field] = parseInt(count);
        else data[key][field] += parseInt(count);

        return true;
    };

    /**
     * 将hash中的一个字段按照给定数值递减
     *
     * @param key
     * @param field
     * @param count
     * @returns {Boolean}
     */
    this.hdecrby = function (key, field, count) {
        if (typeof count == 'undefined') count = 1;

        if (!this.hget(key, field)) data[key][field] = -parseInt(count);
        else data[key][field] -= parseInt(count);

        return true;
    };

    /**
     * 返回hash表的所有字段名
     *
     * @param key
     * @returns
     */
    this.hkeys = function (key) {
        if (!this.exists(key)) return [];

        keys = [];
        i = 0;
        for (field in data[key]) {
            keys[i] = field;
            i++;
        }
        return keys;
    };

    /*
     * List
     */
    /**
     * 返回链表的长度
     *
     * @param key
     */
    this.llen = function (key) {
        if (!this.exists(key)) return 0;

        return data[key].length;
    };

    /**
     * 在给定索引位置插入元素
     *
     * @param key
     * @param index
     * @param value
     * @returns
     */
    this.lset = function (key, index, value) {
        if (!this.exists(key)) data[key] = [];

        return data[key][index] = value;
    };

    /**
     * 在链表最前面插入元素
     *
     * @param key
     * @param value
     * @returns
     */
    this.lpush = function (key, value) {
        if (!this.exists(key)) data[key] = [];

        return data[key].unshift(value);
    };

    /**
     * 在链表最后面插入元素
     *
     * @param key
     * @param value
     * @returns
     */
    this.rpush = function (key, value) {
        if (!this.exists(key)) data[key] = [];

        return data[key].push(value);
    };

    /**
     * 将链表最前一个元素取出
     *
     * @param key
     * @returns
     */
    this.lpop = function (key) {
        if (!this.exists(key)) return false;

        return data[key].shift();
    };

    /**
     * 将链表最后一个元素抛出
     *
     * @param key
     * @returns
     */
    this.rpop = function (key) {
        if (!this.exists(key)) return false;

        return data[key].pop();
    };

    /**
     * 返回链表中给定范围的一段
     *
     * @param key
     * @param start
     * @param end
     */
    this.lrange = function (key, start, end) {

    };

    /**
     * 将链表按照给定长度修剪
     *
     * @param key
     * @param start
     * @param end
     * @returns {Boolean}
     */
    this.ltrim = function (key, start, end) {
        if (!this.exists(key)) return false;

        data[key] = data[key].slice(start, end);
        return true;
    };

    /**
     * 返回链表某个位置的元素
     *
     * @param key
     * @param index
     * @returns
     */
    this.lindex = function (key, index) {
        if (!this.exists(key)) return false;

        return data[key][index];
    };

    /**
     * 设置链表某个位置元素的值
     */
    this.lset = function (key, index, value) {
        if (!this.exists(key)) return false;

        data[key][index] = value;
        return true;
    };

    /**
     * Sorted Sets
     */

    /**
     * 检查元素是否在排序集合
     *
     * @param key
     * @param value
     */
    this.zexists = function (key, value) {
        return typeof data[key][value] != 'undefined';
    };

    /**
     * 添加元素和分数到排序集合
     *
     * @param key
     * @param value
     * @param score
     * @returns {Boolean}
     */
    this.zadd = function (key, value, score) {
        if (!this.exists(key)) data[key] = {};

        data[key][value] = score;
        return true;
    };

    /**
     * 从排序集合中删除元素
     *
     * @param key
     * @param value
     * @returns
     */
    this.zrem = function (key, value) {
        if (!this.zexists(key, value)) return false;

        return delete data[key][value];
    };

    /**
     * 获取排序集合的长度
     *
     * @param key
     * @returns
     */
    this.zcard = function (key) {
        if (!this.exists(key)) return 0;

        length = 0;
        for (k in data[key]) {
            length++;
        }
        return length;
    };

    /**
     * 在排序集合中将一个元素的分数递增给定分数
     *
     * @param key
     * @param value
     * @param score
     */
    this.zincrby = function (key, value, score) {
        if (!this.zexists(key, value)) data[key][value] = 0;

        data[key][value] += score;
    };

    /**
     * 在排序集合中将一个元素的分数+1
     *
     * @param key
     * @param value
     */
    this.zincr = function (key, value) {
        this.zincrby(key, value, 1);
    };

    /**
     * 在排序集合中将一个元素的分数递减给定分数
     *
     * @param key
     * @param value
     * @param score
     */
    this.zdecrby = function (key, value, score) {
        if (!this.zexists(key, value)) data[key][value] = 0;

        data[key][value] -= score;
    };

    /**
     * 在排序集合中将一个元素的分数-1
     * @param key
     * @param value
     */
    this.zdecr = function (key, value) {
        this.zdecrby(key, value, 1);
    };

    /**
     * 返回排序集合中给定范围的元素
     *
     * @param key
     * @param start
     * @param end
     * @returns
     * @todo 需要先排序
     */
    this.zrange = function (key, start, end) {
        if (!this.exists(key)) return false;

        return data[key].slice(start, end);
    };

    /**
     * 返回排序集合中给定元素的分数
     *
     * @param key
     * @param value
     * @returns
     */
    this.zscore = function (key, value) {
        if (!this.zexists(key, value)) return false;

        return data[key][value];
    };

    /**
     * 返回排序集合给定元素的排名
     *
     * @param key
     * @param value
     * @returns
     */
    this.zrank = function (key, value) {
        if (!this.zsort(key)) return false;

        var i = 1;
        for (k in data[key]) {
            if (k == value) return i;
            i++;
        }
        return false;
    };

    /**
     * 排序一个集合
     *
     * @todo 优化排序实现
     * @param key
     * @addon
     */
    this.zsort = function (key) {
        if (!this.exists(key)) return false;
        var sortable = [];
        var newdata = {};
        for (var k in data[key]) {
            sortable.push([k, data[key][k]]);
        }

        sortable.sort(function (a, b) {
            return b[1] - a[1];
        });

        for (var i in sortable) {
            newdata[sortable[i][0]] = sortable[i][1];
        }
        data[key] = newdata;
        newdata = null;
        return data[key];
    };

    /**
     * 保存数据的Meta信息
     *
     * @param key
     * @param value
     * @private
     */
    this._save = function(key, value) {
        if (typeof value == 'string' && this._isNumber(value)) {
            meta[key] = 'number';
        } else if (typeof value == 'object' && Object.prototype.toString.apply(value) === '[object Array]') {
            meta[key] = 'array';
        }
        return meta[key] == typeof value;
    };

    /**
     * 获取数据的Meta信息
     *
     * @param key
     * @return {*}
     * @private
     */
    this._meta = function(key) {
        return meta.hasOwnProperty(key) ? meta[key] : false;
    };

    /**
     * 是否数字
     *
     * @param value
     * @return {Boolean}
     * @private
     */
    this._isNumber = function(value) {
        return !isNaN(Number(value));
    };

    /**
     * To string
     *
     * @param value
     * @return {*}
     * @private
     */
    this._toString = function(value) {
        if (typeof value == 'number' || typeof value == 'string') return value.toString();
        return false;
    };

    /**
     * To number
     *
     * @param value
     * @return {*}
     * @private
     */
    this._toNumber = function(value) {
        if (typeof value == 'number') return value;
        if (!isNaN(Number(value))) return Number(value);
        return false;
    };

    /**
     * Is set?
     *
     * @param key
     * @return {Boolean}
     * @private
     */
    this._isSet = function(key) {
        return this._meta(key) == 'array';
    };

    window.rcache = this;
    return window;
}) ();