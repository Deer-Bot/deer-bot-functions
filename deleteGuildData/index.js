const CosmosClient = require('../clients/cosmos-client');
const eventContainer = new CosmosClient('Events');
const guildContainer = new CosmosClient('Guilds');

module.exports = async function(context, req, guildIn, eventsIn) {
  if (req.body && req.body.guildId) {
    if (guildIn[0]) {
      const item = await guildContainer.delete(guildIn[0].id, req.body.guildId);
      if (item.statusCode === 204) {
        if (eventsIn.length > 0) {
          try {
            const {resource} = await eventContainer.storedProcedure(
                process.env.DELETE_STORED_PROCEDURE,
                eventsIn[0].guildId, // partition key
                eventsIn,
            );

            if (resource.deleted != eventsIn.length) {
              context.log.warn(`Event deletion failed with errors: ${resource.errors}\nDeleted: ${resource.deleted}`);
            }
          } catch (err) {
            context.log.warn(err);
          }
        }
        return {
          status: 200,
        };
      }
      return {
        status: 500,
        message: 'Deletion failed',
      };
    }
  }

  return {
    status: 400,
    body: {
      message: 'Request has some parameters missing',
    },
  };
};
