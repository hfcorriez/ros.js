/*
 * Storage (redis like)
 * version: 0.1
 * @requires jQuery
 *
 * Licensed under the MIT:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) Corrie Zhao [hfcorriez@gmail.com]
 *
 */
(function(jQuery) {
	var data = {};
	
	// @todo 会用做记录各种meta信息
	var meta = {};
	
	/*
	 * Base
	 */
	
	// 直取就可以了，性能对比，写了个用例 http://jsperf.com/obj-detail/3 
	this.exists = function(key)
	{
		return data.hasOwnProperty(key);
	};
	
	/**
	 * 获取，如果不存在则返回默认值
	 * 
	 * @param key	
	 * @param d
	 * @todo 考虑将默认值去掉，完全按照redis api设计
	 */ 
	this.get = function(key, d)
	{
		if(!this.exists(key)) return d;
		
		return data[key];
	},
	
	/**
	 * 存储
	 * 
	 * @param key
	 * @param value
	 */
	this.set = function(key, value)
	{
		data[key] = value;
	};
	
	/**
	 * 删除
	 * 
	 * @param key
	 */
	this.del = function(key)
	{
		delete data[key];
	};
	
	/**
	 * 将一个key递增1
	 * 
	 * @param key
	 */
	this.incr = function(key)
	{
		this.incrby(key, 1);
	};
	
	/**
	 * 将一个key按照count递增
	 * 
	 * @param key
	 * @param count
	 * @returns {Boolean}
	 */
	this.incrby = function(key, count)
	{
		if(this.exists(key)) data[key] += parseInt(count);
		else data[key] = count;
		return true;
	};
	
	/**
	 * 将一个key递减1
	 * 
	 * @param key
	 * @returns {Boolean}
	 */
	this.decr = function(key)
	{
		return this.decrby(key, 1);
	};
	
	/**
	 * 将一个key按照count递减
	 * 
	 * @param key
	 * @param count
	 * @returns {Boolean}
	 */
	this.decrby = function(key, count)
	{
		if(this.exists(key)) data[key] -= parseInt(count);
		else data[key] = -count;
		return true;
	};
	
	/**
	 * 存储一个key，并返回存储前的key值
	 * 
	 * @param key
	 * @param value
	 * @returns
	 */
	this.getset = function(key, value)
	{
		if(this.exists(key)) return_value = this.get(key);
		else return_value = false;
		
		this.set(key, value);
		return return_value;
	};
	
	/**
	 * 当key不存在的时候存储
	 * 
	 * @param key
	 * @param value
	 * @returns {Boolean}
	 */
	this.setnx = function(key, value)
	{
		if(!this.exists(key)) 
		{
			data[key] = value;
			return true;
		}
		return false;
	};
	
	/**
	 * 将一个key值append字符串
	 * 
	 * @param key
	 * @param value
	 * @returns {Boolean}
	 */
	this.append = function(key, value)
	{
		if(!this.exists(key)) data[key] = "" + value;
		else data[key] += "" + value;
		return true;
	};
	
	/*
	 * Set
	 */
	
	/**
	 * 返回一个元素在集合中的索引
	 * 
	 * @param key
	 * @param value
	 * @returns {integer} 
	 */
	this.sindex = function(key, value)
	{
		if(!this.exists(key)) return -1;
		
		for(i in data[key]) if(data[key][i] == value) return i;
		
		return -1;
	};
	
	/**
	 * 检查一个元素是否属于一个集合 
	 * 
	 * @param key
	 * @param value
	 * @returns {Boolean}
	 */
	this.sismember = function(key, value)
	{
		if(!this.exists(key)) return false;
		
		return data[key].join("/x0f").indexOf(value) >= 0;
	};
	
	/**
	 * 将一个元素添加到一个集合
	 * 
	 * @param key
	 * @param value
	 * @returns {Boolean}
	 */
	this.sadd = function(key, value)
	{
		if(!this.exists(key)) data[key] = [];
		
		if(!this.sismember(key, value)) data[key].push(value);
		
		return true;
	};
	
	/**
	 * 将一个元素从集合中删除
	 * 
	 * @param key
	 * @param value
	 * @returns
	 */
	this.srem = function(key, value)
	{
		if(!this.exists(key)) return false;
		
		var index = this.sindex(key, value);
		if(index > -1) return data[key].splice(index, index+1); 
		
		return false;
	};
	
	/**
	 * 将集合中最后一个元素抛出
	 * 
	 * @param key
	 * @param value
	 * @returns
	 */
	this.spop = function(key, value)
	{
		if(!this.exists(key)) return false;
		
		return data[key].pop();
	};
	
	/**
	 * 返回集合的长度
	 * 
	 * @param key
	 * @returns
	 */
	this.scard = function(key)
	{
		if(!this.exists(key)) return 0;
		
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
	this.smove = function(key1, key2, value)
	{
		this.srem(key1, value);
		this.sadd(key2, value);
		return true;
	};
	
	/**
	 * 返回结合中的所有元素
	 * 
	 * @param key
	 * @returns
	 */
	this.smembers = function(key)
	{
		return this.get(key);
	};
	
	/**
	 * 获取两个集合的交集
	 * 
	 * @param key1
	 * @param key2
	 */
	this.sinter = function(key1, key2)
	{
		
	};
	
	/**
	 * 返回两个集合的并集
	 * 
	 * @param key1
	 * @param key2
	 */
	this.sunion = function(key1, key2)
	{
		
	};
	
	/**
	 * 返回两个集合的差集
	 * 
	 * @param key1
	 * @param key2
	 */
	this.sdiff = function(key1, key2)
	{
		
	};
	
	/**
	 * 随机返回集合中的一个元素
	 * 
	 * @param key
	 */
	this.srandmember = function(key)
	{
		
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
	this.hexists = function(key, field)
	{
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
	this.hget = function(key, field, d)
	{
		if(!this.hexists(key, field)) return d;
		
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
	this.hset = function(key, field, value)
	{
		if(!this.exists(key)) data[key] = {}; 
		
		data[key][field] = value;
		return true;
	};
	
	/**
	 * 返回hash表的长度
	 * 
	 * @param key
	 * @returns {Number}
	 */
	this.hlen = function(key)
	{
		if(!this.exists(key)) return 0;
		
		var len = 0;
		for(i in data[key]) len++;
		
		return len;
	};
	
	/**
	 * 删除hash中的一个字段
	 * 
	 * @param key
	 * @param field
	 * @returns
	 */
	this.hdel = function(key, field)
	{
		return delete data[key][field];
	};
	
	/**
	 * 获取hash表
	 * 
	 * @param key
	 * @returns
	 */
	this.hgetall = function(key)
	{
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
	this.hincrby = function(key, field, count)
	{
		if(typeof count == 'undefined') count = 1;
		
		if(!this.hget(key, field))  data[key][field] = parseInt(count);
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
	this.hdecrby = function(key, field, count)
	{
		if(typeof count == 'undefined') count = 1;
		
		if(!this.hget(key, field)) data[key][field] = -parseInt(count);
		else data[key][field] -= parseInt(count);
		
		return true;
	};
	
	/**
	 * 返回hash表的所有字段名
	 * 
	 * @param key
	 * @returns
	 */
	this.hkeys = function(key)
	{
		if(!this.exists(key)) return [];
		
		keys = [];
		i = 0;
		for(field in data[key])
		{
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
	this.llen = function(key)
	{
		if(!this.exists(key)) return 0;
		
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
	this.lset = function(key, index, value)
	{
		if(!this.exists(key)) data[key] = []; 
		
		return data[key][index] = value;
	};
	
	/**
	 * 在链表最前面插入元素
	 * 
	 * @param key
	 * @param value
	 * @returns
	 */
	this.lpush = function(key, value)
	{
		if(!this.exists(key)) data[key] = []; 
		
		return data[key].unshift(value);
	};
	
	/**
	 * 在链表最后面插入元素
	 * 
	 * @param key
	 * @param value
	 * @returns
	 */
	this.rpush = function(key, value)
	{
		if(!this.exists(key)) data[key] = [];
		
		return data[key].push(value);
	};
	
	/**
	 * 将链表最前一个元素取出
	 * 
	 * @param key
	 * @returns
	 */
	this.lpop = function(key)
	{
		if(!this.exists(key)) return false;
		
		return data[key].shift();
	};
	
	/**
	 * 将链表最后一个元素抛出
	 * 
	 * @param key
	 * @returns
	 */
	this.rpop = function(key)
	{
		if(!this.exists(key)) return false;
		
		return data[key].pop();
	};
	
	/**
	 * 返回链表中给定范围的一段
	 * 
	 * @param key
	 * @param start
	 * @param end
	 */
	this.lrange = function(key, start, end)
	{
		
	};
	
	/**
	 * 将链表按照给定长度修剪
	 * 
	 * @param key
	 * @param start
	 * @param end
	 * @returns {Boolean}
	 */
	this.ltrim = function(key, start, end)
	{
		if(!this.exists(key)) return false;
		
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
	this.lindex = function(key, index)
	{
		if(!this.exists(key)) return false;
		
		return data[key][index]; 
	};
	
	/**
	 * 设置链表某个位置元素的值
	 */
	this.lset = function(key, index, value)
	{
		if(!this.exists(key)) return false;
		
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
	this.zexists = function(key, value)
	{
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
	this.zadd = function(key, value, score)
	{
		if(!this.exists(key)) data[key] = {};
		
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
	this.zrem = function(key, value)
	{
		if(!this.zexists(key, value)) return false;
		
		return delete data[key][value];
	};
	
	/**
	 * 获取排序集合的长度
	 * 
	 * @param key
	 * @returns
	 */
	this.zcard = function(key)
	{
		if(!this.exists(key)) return 0;
		
		length = 0;
		for(k in data[key])
		{
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
	this.zincrby = function(key, value, score)
	{
		if(!this.zexists(key, value)) data[key][value] = 0;
		
		data[key][value] += score;
	};
	
	/**
	 * 在排序集合中将一个元素的分数+1
	 * 
	 * @param key
	 * @param value
	 */
	this.zincr = function(key, value)
	{
		this.zincrby(key, value, 1);
	};
	
	/**
	 * 在排序集合中将一个元素的分数递减给定分数
	 * 
	 * @param key
	 * @param value
	 * @param score
	 */
	this.zdecrby = function(key, value, score)
	{
		if(!this.zexists(key, value)) data[key][value] = 0;
		
		data[key][value] -= score;
	};
	
	/**
	 * 在排序集合中将一个元素的分数-1
	 * @param key
	 * @param value
	 */
	this.zdecr = function(key, value)
	{
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
	this.zrange = function(key, start, end)
	{
		if(!this.exists(key)) return false;
		
		return data[key].slice(start, end);
	};
	
	/**
	 * 返回排序集合中给定元素的分数
	 * 
	 * @param key
	 * @param value
	 * @returns
	 */
	this.zscore = function(key, value)
	{
		if(!this.zexists(key, value)) return false;
		
		return data[key][value];
	};
	
	/**
	 * 返回排序集合给定元素的排名
	 * 
	 * @param key
	 * @param value
	 * @returns
	 */
	this.zrank = function(key, value)
	{
		if(!this.zsort(key)) return false;
		
		var i = 1;
		for(k in data[key])
		{
			if(k == value) return i;
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
	this.zsort = function(key)
	{
		if(!this.exists(key)) return false;
		var sortable = [];
		var newdata = {};
		for (var k in data[key])
		{
			sortable.push([k, data[key][k]]);
		}
		
		sortable.sort(function(a, b) {return b[1] - a[1];});
		
		for(var i in sortable)
		{
			newdata[sortable[i][0]] = sortable[i][1];
		}
		data[key] = newdata;
		newdata = null;
		return data[key];
	};
	
	jQuery.storage = this;
	return jQuery;
})(jQuery);