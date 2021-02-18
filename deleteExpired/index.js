const CosmosClient = require('../clients/cosmos-client');
const container = new CosmosClient('Events');

module.exports = async function(context, myTimer, expiredEvents) {
  if (expiredEvents.length > 0) {
    const {resource} = await container.storedProcedure(
        process.env.DELETE_EXPIRED_PROCEDURE,
        expiredEvents[0].author,
        expiredEvents,
    );

    if (resource.deleted != expiredEvents.length) {
      context.log.warn(`Expired event deletion failed with errors: ${resource.errors}`);
    }
  }
};
