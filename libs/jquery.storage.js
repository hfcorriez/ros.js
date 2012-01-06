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
	var meta = {};
	
	/*
	 * Base
	 */
	
	// 添加 data.hasOwnProperty，排除从 prototype 中继承过来的属性 
	this.exists = function(key)
	{
		return key in data && data.hasOwnProperty(key);
	};
	
	this.get = function(key, d)
	{
		if(!this.exists(key)) return d;
		
		return data[key];
	},
	
	this.set = function(key, value)
	{
		data[key] = value;
	};
	
	this.del = function(key)
	{
		delete data[key];
	};
	
	this.incr = function(key)
	{
		this.incrby(key, 1);
	};
	
	this.incrby = function(key, count)
	{
		if(this.exists(key)) data[key] += parseInt(count);
		else data[key] = count;
		return true;
	};
	
	this.decr = function(key)
	{
		return this.decrby(key, 1);
	};
	
	this.decrby = function(key, count)
	{
		if(this.exists(key)) data[key] -= parseInt(count);
		else data[key] = -count;
		return true;
	};
	
	this.getset = function(key, value)
	{
		if(this.exists(key)) return_value = this.get(key);
		else return_value = false;
		
		this.set(key, value);
		return return_value;
	};
	
	this.setnx = function(key, value)
	{
		if(!this.exists(key)) 
		{
			data[key] = value;
			return true;
		}
		return false;
	};
	
	this.append = function(key, value)
	{
		if(!this.exists(key)) data[key] = "" + value;
		else data[key] += "" + value;
		return true;
	};
	
	/*
	 * Set
	 */
	this.sindex = function(key, value)
	{
		if(!this.exists(key)) return -1;
		
		for(i in data[key]) if(data[key][i] == value) return i;
		
		return -1;
	};
	
	this.sismember = function(key, value)
	{
		if(!this.exists(key)) return false;
		
		return data[key].join("/x0f").indexOf(value) >= 0;
	};
	
	this.sadd = function(key, value)
	{
		if(!this.exists(key)) data[key] = [];
		
		if(!this.sismember(key, value)) data[key].push(value);
		
		return true;
	};
	
	this.srem = function(key, value)
	{
		if(!this.exists(key)) return false;
		
		var index = this.sindex(key, value);
		if(index > -1) return data[key].splice(index, index+1); 
		
		return false;
	};
	
	this.spop = function(key, value)
	{
		if(!this.exists(key)) return false;
		
		return data[key].pop();
	};
	
	this.scard = function(key)
	{
		if(!this.exists(key)) return 0;
		
		return data[key].length;
	};
	
	this.smove = function(key1, key2, value)
	{
		this.srem(key1, value);
		this.sadd(key2, value);
		return true;
	};
	
	this.smembers = function(key)
	{
		return this.get(key);
	};
	
	this.sinter = function(key1, key2)
	{
		
	};
	
	this.sunion = function(key1, key2)
	{
		
	};
	
	this.sdiff = function(key1, key2)
	{
		
	};
	
	this.srandmember = function(key)
	{
		
	};
	
	/*
	 * Hash
	 */
	this.hexists = function(key, field)
	{
		return typeof data[key][field] != 'undefined';
	};
	
	this.hget = function(key, field, d)
	{
		if(!this.hexists(key, field)) return d;
		
		return data[key][field];
	};
	
	this.hset = function(key, field, value)
	{
		if(!this.exists(key)) data[key] = {}; 
		
		data[key][field] = value;
		return true;
	};
	
	this.hlen = function(key)
	{
		if(!this.exists(key)) return 0;
		
		var len = 0;
		for(i in data[key]) len++;
		
		return len;
	};
	
	this.hdel = function(key, field)
	{
		return delete data[key][field];
	};
	
	this.hgetall = function(key)
	{
		return this.get(key);
	};
	
	this.hincrby = function(key, field, count)
	{
		if(typeof count == 'undefined') count = 1;
		
		if(!this.hget(key, field))  data[key][field] = parseInt(count);
		else data[key][field] += parseInt(count);
		
		return true;
	};
	
	this.hdecrby = function(key, field, count)
	{
		if(typeof count == 'undefined') count = 1;
		
		if(!this.hget(key, field)) data[key][field] = -parseInt(count);
		else data[key][field] -= parseInt(count);
		
		return true;
	};
	
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
	this.llen = function(key)
	{
		if(!this.exists(key)) return 0;
		
		return data[key].length;
	};
	
	this.lset = function(key, index, value)
	{
		if(!this.exists(key)) data[key] = []; 
		
		return data[key][index] = value;
	};
	
	this.lpush = function(key, value)
	{
		if(!this.exists(key)) data[key] = []; 
		
		return data[key].unshift(value);
	};
	
	this.rpush = function(key, value)
	{
		if(!this.exists(key)) data[key] = [];
		
		return data[key].push(value);
	};
	
	this.lpop = function(key)
	{
		if(!this.exists(key)) return false;
		
		return data[key].shift();
	};
	
	this.rpop = function(key)
	{
		if(!this.exists(key)) return false;
		
		return data[key].pop();
	};
	
	this.lrange = function(key, start, end)
	{
		
	};
	
	this.ltrim = function(key, start, end)
	{
		if(!this.exists(key)) return false;
		
		data[key] = data[key].slice(start, end);
		return true;
	};
	
	this.lindex = function(key, index)
	{
		if(!this.exists(key)) return false;
		
		return data[key][index]; 
	};
	
	this.lset = function(key, index, value)
	{
		if(!this.exists(key)) return false;
		
		data[key][index] = value; 
		return true;
	};
	
	/**
	 * Sorted Sets
	 */
	this.zexists = function(key, value)
	{
		return typeof data[key][value] != 'undefined';
	};
	
	this.zadd = function(key, value, score)
	{
		if(!this.exists(key)) data[key] = {};
		
		data[key][value] = score;
		return true;
	};
	
	this.zrem = function(key, value)
	{
		if(!this.zexists(key, value)) return false;
		
		return delete data[key][value];
	};
	
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
	
	this.zincrby = function(key, value, score)
	{
		if(!this.zexists(key, value)) data[key][value] = 0;
		
		data[key][value] += score;
	};
	
	this.zincr = function(key, value)
	{
		this.zincrby(key, value, 1);
	};
	
	this.zdecrby = function(key, value, score)
	{
		if(!this.zexists(key, value)) data[key][value] = 0;
		
		data[key][value] -= score;
	};
	
	this.zdecr = function(key, value)
	{
		this.zdecrby(key, value, 1);
	};
	
	this.zrange = function(key, start, end)
	{
		if(!this.exists(key)) return false;
		
		return data[key].slice(start, end);
	};
	
	this.zscore = function(key, value)
	{
		if(!this.zexists(key, value)) return false;
		
		return data[key][value];
	};
	
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
	 * @todo 优化排序实现
	 * @param key
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