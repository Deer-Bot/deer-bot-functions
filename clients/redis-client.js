'use strict';

const {Tedis} = require('tedis');

const cacheConnection = new Tedis({
  host: process.env.REDIS_HOSTNAME,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_KEY,
  //  settare tls
});

class RedisClient {
  constructor(dbIndex) {
    this.dbIndex = dbIndex;
  }

  async get(key) {
    await cacheConnection.command('select', this.dbIndex);
    return cacheConnection.hgetall(key);
  }

  async del(key) {
    await cacheConnection.command('select', this.dbIndex);
    await cacheConnection.del(key);
  }
}

module.exports = RedisClient;

