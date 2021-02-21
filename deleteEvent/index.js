'use strict';
const RedisClient = require('../clients/redis-client');
const CosmosClient = new (require('../clients/cosmos-client'))('Events');
const DiscordApi = require('../clients/discord-client');

const RedisConversation = new RedisClient(0);
const RedisEventMessage = new RedisClient(2);

/*
  Remove an event Object
*/
module.exports = async function(context, req) {
  if (req.body && req.body.userId) {
    try {
      // get event document object from user session
      const userSession = await RedisConversation.get(req.body.userId);
      // Parse of the nested object
      const [event] = JSON.parse(userSession?.events);

      if (event && event.id) {
        // Delete event from DB
        const item = await CosmosClient.delete(event.id, event.guildId);
        if (item.statusCode === 204) {
          // Delete session from cache
          await RedisConversation.del(req.body.userId);
          await RedisEventMessage.del(event.messageId);
          DiscordApi.deleteMessage(event.channelId, event.messageId);

          return {
            status: '200',
            body: {
              message: 'Event has been correctly deleted',
            },
          };
        }
        // Cancellare la sessione in entrambi i casi ?
        return {
          status: '200',
          body: {
            message: 'No event to delete',
          },
        };
      }

      return {
        status: '400',
        body: {
          message: 'The user has not a valid session',
        },
      };
    } catch (err) {
      context.log(err);
      return {
        status: '500', // Vedere se cambiare status
      };
    }
  }

  return {
    status: '400',
    body: {
      message: 'Request has some parameters missing',
    },
  };
};
