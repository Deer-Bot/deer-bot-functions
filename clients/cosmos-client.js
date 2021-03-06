'use strict';

const cosmos = require('@azure/cosmos');
const endpoint = process.env.COSMOS_ENDPOINT_URL;
const key = process.env.COSMOS_KEY;
const {CosmosClient} = cosmos;

const client = new CosmosClient({endpoint, key});
const database = client.database(process.env.DB_NAME);

class Client {
  /**
   * Creates a Client redis for the passed cointainer
   * @param {string} containerId
   */
  constructor(containerId) {
    this.database = database;
    this.container = database.container(containerId);
  }

  /**
   * Retrieve a document by ID
   * @param {string} id
   * @param {string} partitionKey
   */
  async get(id, partitionKey) {
    return this.container.item(id, partitionKey).read();
  }

  /**
   *  Execute the passed query
   * @param {string | SqlQuerySpec} sqlQuerySpec
   */
  async query(sqlQuerySpec) {
    return this.container.items.query(sqlQuerySpec).fetchAll();
  }

  /**
   * Delete the document with the passed ID
   * @param {string} id
   * @param {string} partitionKey
   */
  async delete(id, partitionKey) {
    return this.container.item(id, partitionKey).delete();
  }

  /**
   *  Calls a stored procedure from the container
   * @param {string} name name of the stored procedure
   * @param {any} partitionKey partition key value
   * @param {any[]} data parameters passed to the stored procedure
   */
  async storedProcedure(name, partitionKey, data) {
    return this.container.scripts.storedProcedure(name).execute(partitionKey, JSON.stringify(data));
  }
}

module.exports = Client;
