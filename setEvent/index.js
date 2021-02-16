'use strict';
/*
  Set a new event Object
*/
const RedisClient = require('../clients/redis-client');
const CosmosClient = new (require('../clients/cosmos-client'))('Events');

module.exports = async function(context, req) {
  if (req.body && req.body.user) {
    try {
      // get event document object
      const userSession = await RedisClient.get(req.body.user);
      // Parse of the nested object
      const [event] = JSON.parse(userSession?.events);

      if (event) {
        let eventIn = {};
        // Checks if the document already exists
        if (event.id) {
          const item = await CosmosClient.get(event.id, event.author);
          eventIn = item.resource; // resource contains the document retrivied
        }

        // Set document object
        context.bindings.eventOut = eventIn;
        context.bindings.eventOut.author = event['author'] || req.body.user;
        context.bindings.eventOut.guild = event['guild'] || context.bindings.eventOut.guild;
        context.bindings.eventOut.name = event['name'] || context.bindings.eventOut.name;
        context.bindings.eventOut.description = event['description'] || context.bindings.eventOut.description;
        context.bindings.eventOut.date = event['date'] || context.bindings.eventOut.date;
        context.bindings.eventOut.globalReminder = event['globalReminder'] || context.bindings.eventOut.globalReminder;
        context.bindings.eventOut.privateReminder = event['privateReminder'] || context.bindings.eventOut.privateReminder;
        // Dates for next reminder
        const {globalDate, privateDate} = getDateReminder(context.bindings.eventOut.date, context.bindings.eventOut.globalReminder, context.bindings.eventOut.privateReminder);
        context.bindings.eventOut.globalReminderDate = globalDate;
        context.bindings.eventOut.privateReminderDate = privateDate;
        // Delete session from cache
        await RedisClient.del(req.body.user);
      } else {
        return {
          status: '400',
          body: {
            message: 'The user has not a valid session',
          },
        };
      }

      return {
        status: '200',
        body: {
          message: 'Event has been correctly updated',
        },
      };
    } catch (err) {
      context.log(err);
      return {
        status: '500', // Vedere se cambiare status
      };
    }
  } else {
    return {
      status: '400',
      body: {
        message: 'Request has some parameters missing',
      },
    };
  }
};

// Simple function to calculate next date reminder
function getDateReminder(eventDate, globalReminder, privateReminder) {
  // Date for next global reminder
  const globalDate = new Date(Date.now());
  globalDate.setUTCDate(globalDate.getDate() + (+globalReminder));
  globalDate.setUTCHours(0, 0);
  // Date for next private reminder
  const privateDate = new Date(eventDate);
  const hours = Math.floor(privateReminder / 60);
  const min = privateReminder % 60;
  privateDate.setHours(privateDate.getHours() - hours);
  privateDate.setMinutes(privateDate.getMinutes() - min);

  return {
    globalDate: globalDate,
    privateDate: privateDate,
  };
}

