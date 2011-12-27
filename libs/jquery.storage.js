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
	this.data = {};
	
	this.exists = function(key)
	{
		return typeof this.data[key] != 'undefined';
	};
	
	this.get = function(key, d)
	{
		if(!this.exists(key)) return d;
		
		return this.data[key];
	},
	
	this.set = function(key, value)
	{
		this.data[key] = value;
	};
	
	this.del = function(key)
	{
		delete this.data[key];
	};
	
	this.sindex = function(key, value)
	{
		if(!this.exists(key)) return -1;
		
		for(i in this.data[key]) if(this.data[key][i] == value) return i;
		
		return -1;
	};
	
	this.sismember = function(key, value)
	{
		if(!this.exists(key)) return false;
		
		return this.data[key].join("/x0f").indexOf(value) >= 0;
	};
	
	this.sadd = function(key, value)
	{
		if(!this.exists(key)) this.data[key] = [];
		
		if(!this.sismember(key, value)) this.data[key].push(value);
		
		return true;
	};
	
	this.srem = function(key, value)
	{
		if(!this.exists(key)) return false;
		
		var index = this.sindex(key, value);
		if(index > -1) return this.data[key].splice(index, index+1); 
		
		return false;
	};
	
	this.spop = function(key, value)
	{
		if(!this.exists(key)) return false;
		
		return this.data[key].pop();
	};
	
	this.scard = function(key)
	{
		if(!this.exists(key)) return 0;
		
		return this.data[key].length;
	};
	
	this.hexists = function(key, field)
	{
		return typeof this.data[key][field] != 'undefined';
	};
	
	this.hget = function(key, field, d)
	{
		if(!this.hexists(key, field)) return d;
		
		return this.data[key][field];
	};
	
	this.hset = function(key, field, value)
	{
		if(!this.exists(key)) this.data[key] = {}; 
		
		this.data[key][field] = value;
		return true;
	};
	
	this.hlen = function(key)
	{
		if(!this.exists(key)) return 0;
		
		var len = 0;
		for(i in this.data[key]) len++;
		
		return len;
	};
	
	this.hdel = function(key, field)
	{
		return delete this.data[key][field];
	};
	
	this.llen = function(key)
	{
		if(!this.exists(key)) return 0;
		
		return this.data[key].length;
	};
	
	this.lset = function(key, index, value)
	{
		if(!this.exists(key)) this.data[key] = []; 
		
		return this.data[key][index] = value;
	};
	
	this.lpush = function(key, value)
	{
		if(!this.exists(key)) this.data[key] = []; 
		
		return this.data[key].unshift(value);
	};
	
	this.rpush = function(key, value)
	{
		if(!this.exists(key)) this.data[key] = [];
		
		return this.data[key].push(value);
	};
	
	this.lpop = function(key)
	{
		if(!this.exists(key)) return false;
		
		return this.data[key].shift();
	};
	
	this.rpop = function(key)
	{
		if(!this.exists(key)) return false;
		
		return this.data[key].pop();
	};
	
	jQuery.storage = this;
	return jQuery;
})(jQuery);