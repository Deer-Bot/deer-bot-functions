'use strict';

const {Tedis} = require('tedis');

const cacheConnection = new Tedis({
  host: process.env.REDIS_HOSTNAME,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_KEY,
  //  settare tls
});

class RedisClient {
  static async get(key) {
    await cacheConnection.command('select', 0);
    return cacheConnection.hgetall(key);
  }

  static async del(key) {
    await cacheConnection.command('select', 0);
    await cacheConnection.del(key);
  }
}

module.exports = RedisClient;

