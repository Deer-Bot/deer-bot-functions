const redis = require('redis');
const bluebird = require('bluebird');

const cacheConnection = redis.createClient({
  host: process.env.REDIS_HOSTNAME,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_KEY,
//  tls: {servername: process.env.REDIS_HOSTNAME}, // Understand
});

cacheConnection.hgetall = bluebird.promisify(cacheConnection.hgetall).bind(cacheConnection);
cacheConnection.del = bluebird.promisify(cacheConnection.del).bind(cacheConnection);
cacheConnection.select = bluebird.promisify(cacheConnection.select).bind(cacheConnection);

class RedisClient {
  static async get(key) {
    await cacheConnection.select(0);
    return cacheConnection.hgetall(key);
  }

  static async del(key) {
    await cacheConnection.select(0);
    return cacheConnection.del(key);
  }
}

module.exports = RedisClient;

