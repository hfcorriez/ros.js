var ros = (function () {
  /**
   * Extend each method of Array
   * @param fn
   * @return {Array}
   */
  if (!Array.prototype.each) {
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
  }

  /**
   * Extend unique method of Array
   * @return {Array}
   */
  if (!Array.prototype.uniquelize) {
    Array.prototype.uniquelize = function () {
      var ra = new Array();
      for (var i = 0; i < this.length; i++) {
        if (!ra.contains(this[i])) {
          ra.push(this[i]);
        }
      }
      return ra;
    };
  }

  /**
   * Extent contains method of Array
   * @param item
   * @return {Boolean}
   */
  if (!Array.prototype.contains) {
    Array.prototype.contains = function (item) {
      return RegExp(item).test(this);
    };
  }

  /**
   * Extent size method of Object
   *
   * @param obj
   * @return {Number}
   */
  if (!Object.prototype.size) {
    Object.prototype.size = function () {
      var size = 0, key;
      for (key in this) {
        if (this.hasOwnProperty(key)) size++;
      }
      return size;
    };
  }

  // Storage of data
  var data = {};

  // Sorted List
  var sort = {};

  // Sorted Rank
  var rank = {};

  // Meta of data
  var meta = {};

  // Last error
  var error = null;

  var STRING = 0;
  var LIST = 1;
  var SET = 2;
  var HASH = 3;
  var ZSET = 4;

  return {

    /*
     * Base
     */

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
      var keys = [];
      var re = new RegExp('^' + pattern.replace('*', '(.*?)') + '$');
      for (var key in data) if (data.hasOwnProperty(key) && true == re.test(key)) keys.push(key);
      return keys;
    },

    /**
     * Get random key
     *
     * @return {String}
     */
    randomkey: function () {
      var result, count = 0;
      for (var key in data) if (data.hasOwnProperty(key) && Math.random() < 1 / ++count) {
        result = key;
        break;
      }
      return result;
    },

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
      return typeof meta[key] == 'number' ? meta[key] : null;
    },

    /*
     * String
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

      return this.exists(key) ? data[key].hasOwnProperty(value) : false;
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

      var pop_value = false, count = 0;
      for (var i in data[key]) if (data[key].hasOwnProperty(i) && Math.random() < 1 / ++count) {
        pop_value = i;
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

      var members = [];
      for (var i in data[key]) {
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
      set.each(function (value) {
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
      if (!this._is(key, HASH)) return this._error('Error type of Hash');
      if (!this.exists(key)) return false;

      return data[key].hasOwnProperty(field);
    },

    /**
     * Get field in hash
     *
     * @param key
     * @param field
     * @return {*|Boolean}
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
      if (!this._is(key, HASH)) return this._error('Error type of Hash');

      if (!this.exists(key)) this._init(key, HASH);

      var ret = data[key].hasOwnProperty(field) ? 0 : 1;
      return (data[key][field] = value, ret);
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
      if (!this._is(key, HASH)) return this._error('Error type of Hash');

      if (!this.exists(key)) {
        return this.hset(key, field, value);
      } else {
        return !data[key].hasOwnProperty(field) ? (data[key][field] = value, 1) : 0;
      }
    },

    /**
     * Get size of hash
     *
     * @param key
     * @return {Number|Boolean}
     */
    hlen: function (key) {
      if (!this._is(key, HASH)) return this._error('Error type of Hash');
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
      if (!this._is(key, HASH)) return this._error('Error type of Hash');

      if (!this.exists(key)) return 0;

      return data[key].hasOwnProperty(field) ? (delete data[key][field], 1) : 0;
    },

    /**
     * Get all fields of hash
     *
     * @param key
     * @return {*|Boolean}
     */
    hgetall: function (key) {
      if (!this._is(key, HASH)) return this._error('Error type of Hash');

      return this.exists(key) ? data[key] : {};
    },

    /**
     * Increasing a field by count in hash
     *
     * @param key
     * @param field
     * @param count
     * @return {Number|Boolean}
     */
    hincrby: function (key, field, count) {
      if (!this._is(key, HASH)) return this._error('Error type of Hash');

      count = this._toNumber(count);
      if (false === count) return this._error("Error type of count");

      if (data[key].hasOwnProperty(field)) {
        var v_count = this._toNumber(data[key][field]);

        if (v_count === false) return this._error("Error hash value is not integer");

        data[key][field] = v_count + count;
      } else {
        data[key][field] = count;
      }

      return data[key][field];
    },

    /**
     * Get all fields in hash
     *
     * @param key
     * @return {Array|Boolean}
     */
    hkeys: function (key) {
      if (!this._is(key, HASH)) return this._error('Error type of Hash');
      if (!this.exists(key)) return [];

      var keys = [];
      for (var field in data[key]) if (data[key].hasOwnProperty(field))keys.push(field);
      return keys;
    },

    /**
     * Get all values in hash
     *
     * @param key
     * @return {Array|Boolean}
     */
    hvals: function (key) {
      if (!this._is(key, HASH)) return this._error('Error type of Hash');
      if (!this.exists(key)) return [];

      var keys = [];
      for (var field in data[key]) if (data[key].hasOwnProperty(field))keys.push(data[key][field]);
      return keys;
    },

    /**
     * Multiple get field in hash
     *
     * @param key
     * @param fields
     * @return {Object|Boolean}
     */
    hmget: function (key, fields) {
      if (!this._is(key, HASH)) return this._error('Error type of Hash');
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
     * @return {Object|Boolean}
     */
    hmset: function (key, hash) {
      if (!this._is(key, HASH)) return this._error('Error type of Hash');
      if (!this.exists(key)) this._init(key, HASH);

      for (var i in hash) {
        if (hash.hasOwnProperty(i)) data[key][i] = hash[i];
      }
      return true;
    },

    /*
     * List
     */

    /**
     * Return length of List
     *
     * @param key
     * @return {Number|Boolean}
     */
    llen: function (key) {
      if (!this._is(key, LIST)) return this._error('Error type of List');
      if (!this.exists(key)) return 0;

      return data[key].length;
    },

    /**
     * Insert element with given index
     *
     * @param key
     * @param index
     * @param value
     * @return {Boolean}
     */
    lset: function (key, index, value) {
      if ((index = this._toNumber(index)) === false) return this._error('Error index is not integer');
      if (!this._is(key, LIST)) return this._error('Error type of List');
      if (!this.exists(key)) this._init(key, LIST);
      if (index > data[key].length) return this._error('Error index over range');

      return (data[key][index] = value, true);
    },

    /**
     * Insert a element from left
     *
     * @param key
     * @param value
     * @return {Number|Boolean}
     */
    lpush: function (key, value) {
      if (!this._is(key, LIST)) return this._error('Error type of List');
      if (!this.exists(key)) this._init(key, LIST);

      return data[key].unshift(value);
    },

    /**
     * Insert a element from right
     *
     * @param key
     * @param value
     * @return {Number|Boolean}
     */
    rpush: function (key, value) {
      if (!this._is(key, LIST)) return this._error('Error type of List');
      if (!this.exists(key)) this._init(key, LIST);

      return data[key].push(value);
    },

    /**
     * Insert element from left only the List is exists
     *
     * @param key
     * @param value
     * @return {Number|Boolean}
     */
    lpushx: function (key, value) {
      if (!this.exists(key)) return 0;

      return this.lpush(key, value);
    },


    /**
     * Insert element from right only the List is exists
     *
     * @param key
     * @param value
     * @return {Number|Boolean}
     */
    rpushx: function (key, value) {
      if (!this.exists(key)) return 0;

      return this.rpush(key, value);
    },

    /**
     * Pop a element from left
     *
     * @param key
     * @return {*|Boolean}
     */
    lpop: function (key) {
      if (!this._is(key, LIST)) return this._error('Error type of List');
      if (!this.exists(key)) return false;

      var v = data[key].shift();
      return typeof v != 'undefined' ? v : false;
    },

    /**
     * Pop a element from right
     *
     * @param key
     * @return {*|Boolean}
     */
    rpop: function (key) {
      if (!this._is(key, LIST)) return this._error('Error type of List');
      if (!this.exists(key)) return false;

      var v = data[key].pop();
      return typeof v != 'undefined' ? v : false;
    },

    /**
     * Return slice of List from left
     *
     * @param key
     * @param start
     * @param end
     * @return {Array|Boolean}
     */
    lrange: function (key, start, end) {
      if (!this._is(key, LIST)) return this._error('Error type of List');
      if (!this.exists(key)) return [];

      return data[key].slice(start, end === -1 ? data[key].length : end + 1);
    },

    /**
     * Trim List from left
     *
     * @param key
     * @param start
     * @param end
     * @return {Boolean}
     */
    ltrim: function (key, start, end) {
      if (!this._is(key, LIST)) return this._error('Error type of List');
      if (!this.exists(key)) return false;

      data[key] = data[key].slice(start, end === -1 ? data[key].length : end + 1);
      return true;
    },

    /**
     * Get the index of value
     *
     * @param key
     * @param index
     * @return {*}
     */
    lindex: function (key, index) {
      if (!this._is(key, LIST)) return this._error('Error type of List');
      if ((index = this._toNumber(index)) === false) return this._error('Error index is not integer');
      if (!this.exists(key)) return false;

      if (index < 0) index += data[key].length;

      return index in data[key] ? data[key][index] : false;
    },

    /**
     * Remove elements
     *
     * @param key
     * @param count
     * @param value
     * @return {Number|Boolean}
     */
    lrem: function (key, count, value) {
      if (!this._is(key, LIST)) return this._error('Error type of List');
      if (!this.exists(key)) return 0;
      if ((count = this._toNumber(count)) === false) return this._error('Error count is not integer');
      if (0 === count) return 0;

      var len = data[key].length;
      var num = 0;
      var i;
      if (count > 0) {
        for (i = 0; i < len; i++) {
          if (data[key][i - num] === value) {
            data[key].splice(i - num, 1);
            num++;

            if (num === count) break;
          }
        }
      } else {
        for (i = len - 1; i >= 0; i--) {
          if (data[key][i + num] === value) {
            data[key].splice(i + num, 1);
            num--;

            if (num === count) break;
          }
        }
      }
      return Math.abs(num);
    },

    /**
     * Pop element from right then push it to other list from left
     *
     * @param key1
     * @param key2
     * @return {*}
     */
    rpoplpush: function (key1, key2) {
      if (!this._is(key1, LIST)) return this._error('Error type of List');
      if (!this._is(key2, LIST)) return this._error('Error type of List');

      var value = this.rpop(key1);
      if (value !== false) this.lpush(key2, value);
      return value;
    },

    /*
     * Sorted Sets
     */

    /**
     * Add a element to sorted set
     *
     * @param key
     * @param value
     * @param score
     * @return {Number|Boolean}
     */
    zadd: function (key, score, value) {
      if (!this._is(key, ZSET)) return this._error('Error type of ZSET');
      if (!this.exists(key)) this._init(key, ZSET);

      var return_value = 0, inserted = false;

      // If not exists return value is 1
      if (!data[key].hasOwnProperty(value)) {
        return_value = 1;
      } else {
        // Delete from sorted list
        sort[key].splice(rank[key][value], 1);
        // Delete rank
        delete rank[key][value];
      }

      // Set value
      data[key][value] = score;
      var len = sort[key].length;
      // Loop sorted list
      for (var i = 0; i < len; i++) {
        // Lookup score position
        if (data[key][sort[key][i]] > score) {
          // Insert to position
          sort[key].splice(i, 0, value);
          // Set rank
          rank[key][value] = i;
          inserted = true;
          break;
        }
      }

      // If loop end and does not inserted
      if (!inserted) {
        // Put into end
        sort[key].push(value);
        // Set rank
        rank[key][value] = len;
      }
      return return_value;
    },

    /**
     * Remove element from sorted set
     *
     * @param key
     * @param value
     * @return {Number|Boolean}
     */
    zrem: function (key, value) {
      if (!this._is(key, ZSET)) return this._error('Error type of ZSET');
      if (!this.exists(key)) return 0;
      if (!data[key].hasOwnProperty(value)) return 0;

      delete data[key][value];
      sort[key].splice(rank[key][value], 1);
      delete rank[key][value];
      return 1;
    },

    /**
     * Remove elements by rank
     *
     * @param key
     * @param start
     * @param stop
     * @return {*}
     */
    zremrangebyrank: function (key, start, stop) {
      if (!this._is(key, ZSET)) return this._error('Error type of ZSET');
      if (!this.exists(key)) return 0;

      var remove_members = sort[key].splice(start, stop === -1 ? sort[key].length : stop + 1);
      for (var i = 0, len = remove_members.length; i < len; i++) {
        delete data[key][remove_members[i]];
        delete rank[key][remove_members[i]];
      }
      return remove_members.length;
    },

    /**
     * Remove elements by score
     *
     * @param key
     * @param min
     * @param max
     * @return {*}
     */
    zremrangebyscore: function (key, min, max) {
      if (!this._is(key, ZSET)) return this._error('Error type of ZSET');
      if (!this.exists(key)) return 0;

      var num = 0;
      for (var i = 0, len = sort[key].length; i < len; i++) {
        var value = data[key][sort[key][i - num]];
        if (value >= min && value <= max) {
          sort[key].splice(i - num, 1);
          delete data[key][value];
          delete rank[key][value];
          num++;
        }
      }
      return num;
    },

    /**
     * Get length of all elements
     *
     * @param key
     * @return {Number|Boolean}
     */
    zcard: function (key) {
      if (!this._is(key, ZSET)) return this._error('Error type of ZSET');
      if (!this.exists(key)) return 0;

      return sort[key].length;
    },

    /**
     * Get lenght of sorted set with given arguments
     *
     * @param key
     * @return {Number|Boolean}
     */
    zcount: function (key, start, end) {
      if (!this._is(key, ZSET)) return this._error('Error type of ZSET');
      if (!this.exists(key)) return 0;

      return sort[key].slice(start, end === -1 ? sort[key].length : end + 1).length;
    },

    /**
     * Return a range of sorted set
     *
     * @param key
     * @param start
     * @param end
     * @return {Array|Object|Boolean}
     */
    zrange: function (key, start, end, withscores) {
      if (!this._is(key, ZSET)) return this._error('Error type of ZSET');
      if (!this.exists(key)) return [];

      var members = sort[key].slice(start, end === -1 ? sort[key].length : end + 1);

      return !withscores ? members : this._zscores(key, members);
    },

    /**
     * Increse score by value
     *
     * @param key
     * @param count
     * @param value
     * @return {Number|Boolean}
     */
    zincrby: function (key, count, value) {
      var ret = false;
      if (!this.exists(key)) {
        ret = this.zadd(key, count, value);
      } else {
        if (data[key].hasOwnProperty(value)) {
          count = this._toNumber(count);
          if (count === false) return this._error('Error count is not integer');
          ret = this.zadd(key, count + data[key][value], value);
        } else {
          ret = this.zadd(key, count, value);
        }
      }

      if (ret === false) return false;
      return data[key][value];
    },

    /**
     * Get range of sortes set by reverse
     *
     * @param key
     * @param start
     * @param end
     * @param withscores
     * @return {*}
     */
    zrevrange: function (key, start, end, withscores) {
      if (!this._is(key, ZSET)) return this._error('Error type of ZSET');
      if (!this.exists(key)) return [];

      var reverse_sorted_list = sort[key].reverse();
      var members = reverse_sorted_list.slice(start, end === -1 ? sort[key].length : end + 1);

      return !withscores ? members : this._zscores(key, members);
    },

    /**
     * Get range with score
     *
     * @param key
     * @param start
     * @param end
     * @param withscores
     * @return {Array|Object|Boolean}
     */
    zrangebyscore: function (key, start, end, withscores) {
      if (!this._is(key, ZSET)) return this._error('Error type of ZSET');
      if (!this.exists(key)) return [];

      var members = [];
      for (var i = 0, len = sort[key].length; i < len; i++) {
        var value = data[key][sort[key][i]];
        if (value >= start && value <= end) members.push(sort[key][i]);
      }

      return !withscores ? members : this._zscores(key, members);
    },


    /**
     * Get range with score by reverse
     *
     * @param key
     * @param start
     * @param end
     * @param withscores
     * @return {*}
     */
    zrevrangebyscore: function (key, start, end, withscores) {
      if (!this._is(key, ZSET)) return this._error('Error type of ZSET');
      if (!this.exists(key)) return [];

      var members = [];
      for (var len = sort[key].length, i = len; i > 0; i--) {
        var value = data[key][sort[key][i]];
        if (value >= start && value <= end) members.push(sort[key][i]);
      }

      return !withscores ? members : this._zscores(key, members);
    },

    /**
     * Return the score of value in sorted set
     *
     * @param key
     * @param value
     * @return {Number|Boolean}
     */
    zscore: function (key, value) {
      if (!this._is(key, ZSET)) return this._error('Error type of ZSET');
      if (!this.exists(key)) return false;

      return data[key].hasOwnProperty(value) ? data[key][value] : false;
    },

    /**
     * Return the rank of value in sorted set
     *
     * @param key
     * @param value
     * @return {Number|Boolean}
     */
    zrank: function (key, value) {
      if (!this._is(key, ZSET)) return this._error('Error type of ZSET');
      if (!this.exists(key)) return false;
      if (!data[key].hasOwnProperty(value)) return false;

      return rank[key][value];
    },

    /**
     * Get reverse rank of sorted set
     *
     * @param key
     * @param value
     * @return {*}
     */
    zrevrank: function (key, value) {
      var rank;
      if ((rank = this.zrank(key, value)) === false) return false;

      return sort[key].length - rank - 1;
    },

    /**
     * Get member scores
     *
     * @param members
     * @return {Object}
     * @private
     */
    _zscores: function (key, members) {
      var result = {};
      members.each(function (value) {
        result[value] = data[key][value]
      });
      return result;
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
        case HASH:
          data[key] = {};
          break;
        case ZSET:
          data[key] = {};
          sort[key] = [];
          rank[key] = {};
          break;
      }
      meta[key] = type;
    },

    /**
     * Is Numberic?
     *
     * @param value
     * @return {Boolean}
     * @private
     */
    _isNumber: function (value) {
      return !isNaN(Number(value));
    },

    /**
     * Is key with this type?
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
})();

if (typeof module == 'object') {
  module.exports = ros;
} else {
  window = window || {};
  window.ros = ros;
}