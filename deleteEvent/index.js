'use strict';
const RedisClient = new (require('../clients/redis-client'))(0);
const CosmosClient = new (require('../clients/cosmos-client'))('Events');

/*
  Remove an event Object
*/
module.exports = async function(context, req) {
  if (req.body && req.body.user) {
    try {
      // get event document object from user session
      const userSession = await RedisClient.get(req.body.user);
      // Parse of the nested object
      const [event] = JSON.parse(userSession?.events);

      if (event && event.id) {
        // Delete event from DB
        const item = await CosmosClient.delete(event.id, event.author);
        if (item.statusCode === 204) {
          // Delete session from cache
          await RedisClient.del(req.body.user);

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
