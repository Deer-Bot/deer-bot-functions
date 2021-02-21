const CosmosClient = require('../clients/cosmos-client');
const container = new CosmosClient('Events');

module.exports = async function(context, myTimer, expiredEvents) {
  if (expiredEvents.length > 0) {
    const partition = expiredEvents.reduce((set, event) => {
      if (set[event.guildId] == undefined) {
        set[event.guildId] = [];
      }
      set[event.guildId].push(event);
      return set;
    }, {});

    const partitionKeys = Object.keys(partition);
    for (const key of partitionKeys) {
      try {
        const {resource} = await container.storedProcedure(
            process.env.DELETE_STORED_PROCEDURE,
            key, // partition key
            partition[key],
        );

        if (resource.deleted != partition[key].length) {
          context.log.warn(`Expired event deletion failed with errors: ${resource.errors}\nPartition key: ${key}, deleted: ${resource.deleted}`);
        }
      } catch (err) {
        context.log.warn(err);
      }
    }
  }
};
