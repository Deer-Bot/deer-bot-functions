'use strict';

const {TedisPool} = require('tedis');

const connectionPool = new TedisPool({
  host: process.env.REDIS_HOSTNAME,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_KEY,
  tls: {
    servername: process.env.REDIS_HOSTNAME,
  },
});

class RedisClient {
  constructor(dbIndex) {
    this.dbIndex = dbIndex;
  }

  async get(key) {
    const connection = await connectionPool.getTedis();

    await connection.command('select', this.dbIndex);
    const result = await connectionPool.hgetall(key);
    connectionPool.putTedis(connection);

    return result;
  }

  async del(key) {
    const connection = await connectionPool.getTedis();

    await connection.command('select', this.dbIndex);
    await connectionPool.del(key);
    connectionPool.putTedis(connection);
  }
}

module.exports = RedisClient;

