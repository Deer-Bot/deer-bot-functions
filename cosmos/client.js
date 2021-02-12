const cosmos = require('@azure/cosmos');
const endpoint = process.env.COSMOS_ENDPOINT_URL;
const key = process.env.COSMOS_KEY;
const {CosmosClient} = cosmos;

const client = new CosmosClient({endpoint, key});
const database = client.database(process.env.DB_NAME);

class Client {
  constructor(containerId) {
    this.database = database;
    this.container = database.container(containerId);
  }

  async get(id, partitionKey) {
    return this.container.item(id, partitionKey).read();
  }

  async query(sqlQuerySpec) {
    return this.container.items.query(sqlQuerySpec).fetchAll();
  }

  async delete(id, partitionKey) {
    return this.container.item(id, partitionKey).delete();
  }
}

module.exports = Client;
