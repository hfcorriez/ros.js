/*
 * ros.js
 * version: 0.2
 *
 * Licensed under the MIT:
 *   http://www.opensource.org/licenses/mit-license.php
 */

;
(function () {
  /**
   * For each arrayeach
   */
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fun /*, thisp*/) {
      var len = this.length;
      if (typeof fun != "function")
        throw new TypeError();

      var thisp = arguments[1];
      for (var i = 0; i < len; i++) {
        if (i in this)
          fun.call(thisp, this[i], i, this);
      }
    };
  }
  /**
   * Extend each method of Array
   * @param fn
   * @return {Array}
   */
  Array.prototype.each = function (fn) {
    fn = fn || Function.K;
    var a = [];
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < this.length; i++) {
      var res = fn.apply(this, [this[i], i].concat(args));
      if (res != null) a.push(res);
    }
    return a;
  };

  /**
   * Extend unique method of Array
   * @return {Array}
   */
  Array.prototype.uniquelize = function () {
    var ra = new Array();
    for (var i = 0; i < this.length; i++) {
      if (!ra.contains(this[i])) {
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
  Array.prototype.contains = function (item) {
    return RegExp(item).test(this);
  };

  /**
   * Extent size method of Object
   *
   * @param obj
   * @return {Number}
   */
  Object.prototype.size = function () {
    var size = 0, key;
    for (key in this) {
      if (this.hasOwnProperty(key)) size++;
    }
    return size;
  };

  // Storage of data
  var data = {};

  // Meta of data
  var meta = {};

  // Last error
  var error = null;

  var STRING = 0;
  var LIST = 1;
  var SET = 2;
  var HASH = 3;
  var ZSET = 4;

  var TYPES = {
    STRING: 'string',
    LIST: 'list',
    SET: 'set',
    HASH: 'hash',
    ZSET: 'zset'
  };

  /*
   * Base
   */

  window.ros = {
    /**
     * Exist a key?
     *
     * @param key
     * @return {Boolean}
     */
    exists: function (key) {
      return data.hasOwnProperty(key);
    },

    /**
     * Delete a key
     *
     * @return {Boolean}
     */
    del: function (key) {
      return this.exists(key) ? (delete data[key], delete meta[key], 1) : 0;
    },


    /**
     * Rename a key to new key
     *
     * @param key1
     * @param key2
     * @return {Boolean}
     */
    rename: function (key1, key2) {
      return this.exists(key1) ? (this.set(key2, this.get(key1)), this.del(key1), true) : this._error('Error key to rename');
    },

    /**
     * Rename if new key not exists
     *
     * @param key1
     * @param key2
     * @return {Boolean}
     */
    renamenx: function (key1, key2) {
      return !this.exists(key2) ? this.rename(key1, key2) : false;
    },

    /**
     *
     * @param pattern
     * @return {Array}
     */
    keys: function (pattern) {
      var keys = [], key;
      var re = new RegExp('^' + pattern.replace('*', '(.*?)') + '$');
      for (key in data) if (data.hasOwnProperty(key) && true == re.test(key)) keys.push(key);
      return keys;
    },

    /**
     * Get random key
     *
     * @return {String}
     */
    randomkey: function () {
      var key, result, count = 0;
      for (key in data) if (data.hasOwnProperty(key) && Math.random() < 1 / ++count) result = key;
      return result;
    },

    /*
     * Strings
     */

    /**
     * Get a key
     *
     * @param key
     * @return {*}
     */
    get: function (key) {
      if (!this._is(key, STRING)) return this._error('Error type of String');

      return this.exists(key) ? data[key] : false;
    },

    /**
     * Set a key-value pair
     *
     * @param key
     * @param value
     * @return {Boolean}
     */
    set: function (key, value) {
      if (!this._is(key, STRING)) return this._error('Error key type of String');
      if (!this._toString(value)) return this._error('Error type of value');

      if (!this.exists(key)) this._init(key, STRING);

      data[key] = value;
      return true;
    },

    /**
     * Increasing a key
     *
     * @param key
     * @return {Number}
     */
    incr: function (key) {
      return this.incrby(key, 1);
    },

    /**
     * Increasing a key with count
     *
     * @param key
     * @param count
     * @return {Number|Boolean}
     */
    incrby: function (key, count) {
      if (!this._isNumber(count)) return this._error('Error type of count');
      if (!this._is(key, STRING)) return this._error('Error type of STRING');

      // Set if not exists
      if (!this.exists(key)) return this.set(key, count) ? count : false;

      // Check data type and try to convert
      var base;
      if ((base = this._toNumber(data[key])) === false) return this._error('Error type of value');

      return (data[key] = base + parseInt(count), data[key]);
    },

    /**
     * Decreasing a key
     *
     * @param key
     * @return {Number}
     */
    decr: function (key) {
      return this.decrby(key, 1);
    },

    /**
     * Decreasing a key with count
     *
     * @param key
     * @param count
     * @return {Number|Boolean}
     */
    decrby: function (key, count) {
      if (!this._isNumber(count)) return this._error('Error type of count');
      if (!this._is(key, STRING)) return this._error('Error key type of STRING');

      // Set if not exists
      if (!this.exists(key)) return this.set(key, -count) ? -count : false;

      // Check data type and try to convert
      var base;
      if ((base = this._toNumber(data[key])) === false) return this._error('Error type of value');

      return (data[key] = base - parseInt(count), data[key]);
    },

    /**
     * Set a value and get old value
     *
     * @param key
     * @param value
     * @return {Boolean|String|Number}
     */
    getset: function (key, value) {
      if (!this._is(key, STRING)) return this._error('Error type of STRING');

      // Get old value
      var old = this.get(key);

      // Set value
      return this.set(key, value) ? old : false;
    },

    /**
     * Set if not exist
     *
     * @param key
     * @param value
     * @return {Boolean}
     */
    setnx: function (key, value) {
      if (!this._is(key, STRING)) return this._error('Error type of STRING');

      return this.exists(key) ? false : this.set(key, value);
    },

    /**
     * Append string to a key
     *
     * @param key
     * @param value
     * @return {Number|Boolean}
     */
    append: function (key, value) {
      if (!this._is(key, STRING)) return this._error('Error type of STRING');

      value = this._toString(value);
      if (!value) return this._error('Error type of value');

      if (!this.exists(key)) this.set(key, value);
      else data[key] += value;

      return data[key].length;
    },

    /*
     * Set
     */

    /**
     * Check if the member of set
     *
     * @param key
     * @param value
     * @return {Boolean}
     */
    sismember: function (key, value) {
      if (!this._is(key, SET)) return this._error('Error type of SET');

      return this.exists(key) ? value in data[key] : false;
    },

    /**
     * Add a member to set.
     *
     * @param key
     * @param value
     * @return {Boolean}
     */
    sadd: function (key, value) {
      if (!this._is(key, SET)) return this._error('Error type of SET');

      // Init set
      if (!this.exists(key)) this._init(key, SET);

      return !this.sismember(key, value) ? (data[key][value] = 1, 1) : 0;
    },

    /**
     * Remove given value of set
     *
     * @param key
     * @param value
     * @return {Boolean}
     */
    srem: function (key, value) {
      if (!this._is(key, SET)) return this._error('Error type of SET');

      return this.sismember(key, value) ? (delete data[key][value], 1) : 0;
    },

    /**
     * Pop last member of set
     *
     * @param key
     * @return {*|Boolean}
     */
    spop: function (key) {
      if (!this._is(key, SET)) return this._error('Error type of SET');
      if (!this.exists(key)) return false;

      var i, pop_value = false, count = 0;
      for (i in data[key]) if (data[key].hasOwnProperty(i) && Math.random() < 1 / ++count) {
        pop_value = i
        delete data[key][i];
        break;
      }

      return pop_value;
    },

    /**
     * Get length of set
     *
     * @param key
     * @return {Number}
     */
    scard: function (key) {
      if (!this._is(key, SET)) return this._error('Error type of SET');
      if (!this.exists(key)) return 0;

      return data[key].size();
    },

    /**
     * Move value from set1 to set2
     *
     * @param key1
     * @param key2
     * @param value
     * @return {Boolean}
     */
    smove: function (key1, key2, value) {
      if (!this._is(key1, SET)) return this._error('Error key1 type of SET');
      if (!this._is(key2, SET)) return this._error('Error key2 type of SET');

      return this.srem(key1, value) ? (this.sadd(key2, value), 1) : 0;
    },

    /**
     * Get all members of set
     *
     * @param key
     * @return {Array|Boolean}
     */
    smembers: function (key) {
      if (!this._is(key, SET)) return this._error('Error key type of SET');
      if (!this.exists(key)) return [];

      var i, members = [];
      for (i in data[key]) {
        if (data[key].hasOwnProperty(i)) members.push(i);
      }
      return members;
    },

    /**
     * Get intersection of two set
     *
     * @param key1
     * @param key2
     * @return {Array|Boolean}
     */
    sinter: function (key1, key2) {
      if (!this._is(key1, SET)) return this._error('Error key1 type of SET');
      if (!this._is(key2, SET)) return this._error('Error key2 type of SET');

      var data1 = this.smembers(key1);
      var data2 = this.smembers(key2);

      return data1.each(function (o) {
        return data2.contains(o) ? o : null
      });
    },

    /**
     * Store inter of two set
     *
     * @param key
     * @param key1
     * @param key2
     * @return {Number|Boolean}
     */
    sinterstore: function (key, key1, key2) {
      if (!this._is(key, SET)) return this._error('Error key type of SET');

      return this._sset(key, this.sinter(key1, key2));
    },

    /**
     * Get union of two set
     *
     * @param key1
     * @param key2
     * @return {Array|Boolean}
     */
    sunion: function (key1, key2) {
      if (!this._is(key1, SET)) return this._error('Error key1 type of SET');
      if (!this._is(key2, SET)) return this._error('Error key2 type of SET');

      var data1 = this.smembers(key1);
      var data2 = this.smembers(key2);

      return data1.concat(data2).uniquelize();
    },

    /**
     * Store union of two set
     *
     * @param key
     * @param key1
     * @param key2
     * @return {Number||Boolean}
     */
    sunionstore: function (key, key1, key2) {
      if (!this._is(key, SET)) return this._error('Error key type of SET');

      return this._sset(key, this.sunion(key1, key2));
    },

    /**
     * Get diff of two set
     *
     * @param key1
     * @param key2
     * @return {Array|Boolean}
     */
    sdiff: function (key1, key2) {
      if (!this._is(key1, SET)) return this._error('Error key1 type of SET');
      if (!this._is(key2, SET)) return this._error('Error key2 type of SET');

      var data1 = this.smembers(key1);
      var data2 = this.smembers(key2);

      return data1.each(function (o) {
        return data2.contains(o) ? null : o
      });
    },

    /**
     * Store diff of two set
     *
     * @param key
     * @param key1
     * @param key2
     * @return {Number||Boolean}
     */
    sdiffstore: function (key, key1, key2) {
      if (!this._is(key, SET)) return this._error('Error key type of SET');

      return this._sset(key, this.sdiff(key1, key2));
    },

    /**
     * Get random member of set
     *
     * @param key
     * @return {Null||*}
     */
    srandmember: function (key) {
      if (!this._is(key, SET)) return this._error('Error type of SET');
      if (!this.exists(key)) return false;

      var length = data[key].size() - 1,
        random = (Math.random() * length).toFixed(0);
      return data[key][random];
    },

    /**
     * Store set
     *
     * @param key
     * @param set
     * @return {*}
     * @private
     */
    _sset: function (key, set) {
      if (!this._is(key, SET)) return this._error('Error key type of SET');

      if (set === false) return false;
      if (!this.exists(key)) this._init(key, SET);

      var num = 0;
      set.forEach(function (value) {
        data[key][value] = 1;
        num++;
      });
      return num;
    },

    /*
     * Hash
     */

    /**
     * Check if field exist in hash
     *
     * @param key
     * @param field
     * @return {Boolean}
     */
    hexists: function (key, field) {
      return this._isHash(key) ? data[key].hasOwnProperty(field) : false;
    },

    /**
     * Get field in hash
     *
     * @param key
     * @param field
     * @return {*}
     */
    hget: function (key, field) {
      if (!this.hexists(key, field)) return false;

      return data[key][field];
    },

    /**
     * Set field in hash
     *
     * @param key
     * @param field
     * @param value
     * @return {Boolean}
     */
    hset: function (key, field, value) {
      if (!this._isHash(key)) return this._error('Error type of hash');

      if (!this.exists(key)) this.set(key, {});

      return (data[key][field] = value, true);
    },

    /**
     * Set filed in hash if not exists
     *
     * @param key
     * @param field
     * @param value
     * @return {Boolean}
     */
    hsetnx: function (key, field, value) {
      if (!this._isHash(key)) return this._error('Error type of hash');

      return !this.hexists(key, field) ? this.hset(key, field, value) : false;
    },

    /**
     * Get size of hash
     *
     * @param key
     * @return {Number}
     */
    hlen: function (key) {
      if (!this._isHash(key)) return this._error("Error type of hash");
      if (!this.exists(key)) return 0;

      return data[key].size();
    },

    /**
     * Delete field in hash
     *
     * @param key
     * @param field
     * @return {Boolean}
     */
    hdel: function (key, field) {
      if (!this._isHash(key)) return this._error("Error type of hash");

      return this.hexists(key, field) ? (delete data[key][field], true) : false;
    },

    /**
     * Get all fields of hash
     *
     * @param key
     * @return {*}
     */
    hgetall: function (key) {
      if (!this._isHash(key)) return this._error("Error type of hash");

      return this.exists(key) ? data[key] : {};
    },

    /**
     * Increasing a field by count in hash
     *
     * @param key
     * @param field
     * @param count
     * @return {Number||Boolean}
     */
    hincrby: function (key, field, count) {
      if (!this._isHash(key)) return this._error("Error type of hash");

      count = this._toNumber(count);
      if (false === count) return this._error("Error type of count");
      var value = this.hget(key, field);
      var vcount = this._toNumber(value);
      if (null !== value && false === vcount) return this._error("Error type of value");

      if (null === value) this.hset(key, field, count);
      else data[key][field] = vcount + count;

      return data[key][field];
    },

    /**
     * Decreasing a field by count in hash
     *
     * @param key
     * @param field
     * @param count
     * @return {Number||Boolean}
     */
    hdecrby: function (key, field, count) {
      if (!this._isHash(key)) return this._error("Error type of hash");

      count = this._toNumber(count);
      if (false === count) return this._error("Error type of count");
      var value = this.hget(key, field);
      var vcount = this._toNumber(value);
      if (null !== value && false === vcount) return this._error("Error type of value");

      if (null === value) this.hset(key, field, -count);
      else data[key][field] = vcount - count;

      return data[key][field];
    },

    /**
     * Get all fields in hash
     *
     * @param key
     * @return {Array}
     */
    hkeys: function (key) {
      if (!this._isHash(key)) return this._error("Error type of hash");
      if (!this.exists(key)) return [];

      var keys = [];
      for (field in data[key]) if (data[key].hasOwnProperty(field))keys.push(field);
      return keys;
    },

    /**
     * Get all values in hash
     *
     * @param key
     * @return {Array}
     */
    hvals: function (key) {
      if (!this._isHash(key)) return this._error("Error type of hash");
      if (!this.exists(key)) return [];

      var keys = [];
      for (field in data[key]) if (data[key].hasOwnProperty(field))keys.push(data[key][field]);
      return keys;
    },

    /**
     * Multiple get field in hash
     *
     * @param key
     * @param fields
     * @return {Object}
     */
    hmget: function (key, fields) {
      if (!this._isHash(key)) return this._error("Error type of hash");
      if (!this.exists(key)) return {};

      var values = {};
      for (var i in fields) values[fields[i]] = this.hget(key, fields[i]);
      return values;
    },

    /**
     * Multiple set field in hash
     *
     * @param key
     * @param hash
     * @return {Object}
     */
    hmset: function (key, hash) {
      if (!this._isHash(key)) return this._error("Error type of hash");
      if (!this.exists(key)) data[key] = {};

      for (var i in hash) data[key][i] = hash[i];
      return true;
    },

    /*
     * List
     */
    /**
     * Return length of List
     *
     * @param key
     */
    llen: function (key) {
      if (!this._isList(key)) return this._error('Error type of list');
      if (!this.exists(key)) return 0;

      return data[key].length;
    },

    /**
     * 在给定索引位置插入元素
     *
     * @param key
     * @param index
     * @param value
     * @return {Boolean}
     */
    lset: function (key, index, value) {
      if (!this._isList(key)) return this._error('Error type of list');
      if (!this.exists(key)) data[key] = [];

      return (data[key][index] = value, true);
    },

    /**
     * 在链表最前面插入元素
     *
     * @param key
     * @param value
     * @return {Number}
     */
    lpush: function (key, value) {
      if (!this.exists(key)) data[key] = [];

      return data[key].unshift(value);
    },

    /**
     * 在链表最后面插入元素
     *
     * @param key
     * @param value
     * @return {Number}
     */
    rpush: function (key, value) {
      if (!this.exists(key)) data[key] = [];

      return data[key].push(value);
    },

    /**
     * 将链表最前一个元素取出
     *
     * @param key
     * @return {*}
     */
    lpop: function (key) {
      if (!this.exists(key)) return false;

      return data[key].shift();
    },

    /**
     * 将链表最后一个元素抛出
     *
     * @param key
     * @return {*}
     */
    rpop: function (key) {
      if (!this.exists(key)) return false;

      return data[key].pop();
    },

    /**
     * 返回链表中给定范围的一段
     *
     * @param key
     * @param start
     * @param end
     */
    lrange: function (key, start, end) {
      // @todo implements.
    },

    /**
     * 将链表按照给定长度修剪
     *
     * @param key
     * @param start
     * @param end
     * @return {Boolean}
     */
    ltrim: function (key, start, end) {
      if (!this.exists(key)) return false;

      data[key] = data[key].slice(start, end);
      return true;
    },

    /**
     * 返回链表某个位置的元素
     *
     * @param key
     * @param index
     * @return {*}
     */
    lindex: function (key, index) {
      if (!this.exists(key)) return false;

      return data[key][index];
    },

    /**
     * Sorted Sets
     */

    /**
     * 检查元素是否在排序集合
     *
     * @param key
     * @param value
     */
    zexists: function (key, value) {
      return typeof data[key][value] != 'undefined';
    },

    /**
     * 添加元素和分数到排序集合
     *
     * @param key
     * @param value
     * @param score
     * @return {Boolean}
     */
    zadd: function (key, value, score) {
      if (!this.exists(key)) data[key] = {},

        data[key][value] = score;
      return true;
    },

    /**
     * 从排序集合中删除元素
     *
     * @param key
     * @param value
     * @return {Boolean}
     */
    zrem: function (key, value) {
      if (!this.zexists(key, value)) return false;

      return delete data[key][value];
    },

    /**
     * 获取排序集合的长度
     *
     * @param key
     * @return {Number}
     */
    zcard: function (key) {
      if (!this.exists(key)) return 0;

      return data[key].size();
    },

    /**
     * 在排序集合中将一个元素的分数递增给定分数
     *
     * @param key
     * @param value
     * @param score
     * @return {Boolean}
     */
    zincrby: function (key, value, score) {
      if (!this.zexists(key, value)) data[key][value] = 0;

      return data[key][value] += score;
    },

    /**
     * 在排序集合中将一个元素的分数+1
     *
     * @param key
     * @param value
     */
    zincr: function (key, value) {
      zincrby(key, value, 1);
    },

    /**
     * 在排序集合中将一个元素的分数递减给定分数
     *
     * @param key
     * @param value
     * @param score
     */
    zdecrby: function (key, value, score) {
      if (!this.zexists(key, value)) data[key][value] = 0;

      data[key][value] -= score;
    },

    /**
     * 在排序集合中将一个元素的分数-1
     * @param key
     * @param value
     */
    zdecr: function (key, value) {
      zdecrby(key, value, 1);
    },

    /**
     * 返回排序集合中给定范围的元素
     *
     * @param key
     * @param start
     * @param end
     * @return {Array}
     * @todo 需要先排序
     */
    zrange: function (key, start, end) {
      if (!this.exists(key)) return false;

      return data[key].slice(start, end);
    },

    /**
     * 返回排序集合中给定元素的分数
     *
     * @param key
     * @param value
     * @return {*}
     */
    zscore: function (key, value) {
      if (!this.zexists(key, value)) return false;

      return data[key][value];
    },

    /**
     * 返回排序集合给定元素的排名
     *
     * @param key
     * @param value
     * @return {Number||*}
     */
    zrank: function (key, value) {
      if (!this.zsort(key)) return false;

      var i = 1;
      for (k in data[key]) {
        if (k == value) return i;
        i++;
      }
      return false;
    },

    /**
     * 排序一个集合
     *
     * @todo 优化排序实现
     * @param key
     */
    zsort: function (key) {
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
    },

    /*
     * Base
     */

    /**
     * Flush all
     * @return {Boolean}
     */
    flushall: function () {
      data = {};
      meta = {};
      error = null;
      return true;
    },

    /**
     * Flush database
     *
     * @return {Boolean}
     */
    flushdb: function () {
      return this.flushall();
    },

    /**
     * Get database length
     *
     * @return {Number}
     */
    dbsize: function () {
      return data.size();
    },

    /**
     * Type of data
     * @param key
     * @return {*}
     */
    type: function (key) {
      return key in meta ? meta[key] : null;
    },

    /**
     * Init empty data with type
     *
     * @param key
     * @param type
     * @private
     */
    _init: function (key, type) {
      switch (type) {
        case STRING:
          data[key] = '';
          break;
        case LIST:
          data[key] = [];
          break;
        case SET:
        case ZSET:
        case HASH:
          data[key] = {};
          break;
      }
      meta[key] = type;
    },


    /**
     * 保存数据的Meta信息
     *
     * @param key
     * @param value
     * @private
     */
    _save: function (key, value) {
      if (typeof value == 'string' && this._isNumber(value)) {
        meta[key] = 'number';
      } else if (typeof value == 'object' && Object.prototype.toString.apply(value) === '[object Array]') {
        meta[key] = 'array';
      } else {
        meta[key] = typeof value;
      }
    },

    /**
     * 获取数据的Meta信息
     *
     * @param key
     * @return {*}
     * @private
     */
    _meta: function (key) {
      return meta.hasOwnProperty(key) ? meta[key] : false;
    },

    /**
     * 是否数字
     *
     * @param value
     * @return {Boolean}
     * @private
     */
    _isNumber: function (value) {
      return !isNaN(Number(value));
    },

    /**
     * Is key with this type
     *
     * @param key
     * @param type
     * @return {Boolean}
     * @private
     */
    _is: function (key, type) {
      var t = this.type(key);
      return (key in data ? ((t !== null) ? type === t : false) : true);
    },

    /**
     * To string
     *
     * @param value
     * @return {*}
     * @private
     */
    _toString: function (value) {
      if (typeof value == 'number' || typeof value == 'string') return value.toString();
      return false;
    },

    /**
     * To number
     *
     * @param value
     * @return {*}
     * @private
     */
    _toNumber: function (value) {
      if (typeof value == 'number') return value;
      if (!isNaN(Number(value))) return Number(value);
      return false;
    },

    /**
     * Is set?
     *
     * @param key
     * @return {Boolean}
     * @private
     */
    _isSet: function (key) {
      return this._meta(key) == 'array' || this._meta(key) === false;
    },

    /**
     * Is hash?
     *
     * @param key
     * @return {Boolean}
     * @private
     */
    _isHash: function (key) {
      return this._meta(key) == 'object' || this._meta(key) === false;
    },

    /**
     * Is list?
     *
     * @param key
     * @return {Boolean}
     * @private
     */
    _isList: function (key) {
      return this._meta(key) == 'array' || this._meta(key) === false;
    },

    /**
     * Set error
     *
     * @param info
     * @return {Boolean}
     * @private
     */
    _error: function (info) {
      error = info;
      return false;
    },

    /**
     * Get error
     * @return {String}
     */
    error: function () {
      return error;
    }
  };

  return window;
})();