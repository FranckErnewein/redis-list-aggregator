var util = require('util');
var Aggregator = require('node-aggregator');

util.inherits(RedisListAggregator, Aggregator);

function RedisListAggregator(client, key, size, mapper) {
  Aggregator.call(this, mapper || defaultMapper);
}

function defaultMapper(obj) {
  return obj;
}


function init() {}

function attachAggregatorFunction(aggregator) {
  if (typeof aggregator !== 'function') {
    this.aggregator(); //throw error: aggregator not implemented
  }

  if (aggregator.length === 2) {
    this.aggregator = function(value, mem, cb) {
      this.saveInRedis(aggregator(value, mem), cb);
    };
  } else {
    this.aggregator = function(value, mem, cb) {
      aggregator(mem, value, function(v) {
        this.saveInRedis(v, cb);
      }.bind(this));
    }.bind(this);
  }
}

function saveInRedis(value, callback) {
  var redis_value = typeof value === 'object' ? JSON.stringify(value) : value;
  this.client.set(this.key, redis_value, function(err) {
    if (err) {
      throw new Error(err);
    } else {
      callback(value);
    }
  });
}

RedisListAggregator.prototype.init = init;
RedisListAggregator.prototype.attachAggregatorFunction = attachAggregatorFunction;
RedisListAggregator.prototype.saveInRedis = saveInRedis;

module.exports = RedisListAggregator;
