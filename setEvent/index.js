'use strict';
const RedisClient = new (require('../clients/redis-client'))(0);
const CosmosClient = new (require('../clients/cosmos-client'))('Events');
const {v1: uuid} = require('uuid');

/*
  Set a new event Object
*/
module.exports = async function(context, req) {
  if (req.body && req.body.userId) {
    let eventIn = {};

    try {
      // get event document object
      const userSession = await RedisClient.get(req.body.userId);
      // Parse of the nested object
      const [event] = JSON.parse(userSession?.events);

      if (event) {
        // Checks if the document already exists
        if (event.id) {
          const item = await CosmosClient.get(event.id, event.guildId);
          eventIn = item.resource; // resource contains the document retrieved
        } else {
          eventIn.id = uuid();
        }

        // Set document object
        eventIn.authorId = event.authorId || req.body.userId;
        eventIn.guildId = event.guildId || eventIn.guildId;
        eventIn.channelId = event.channelId || eventIn.channelId;
        eventIn.name = event.name || eventIn.name;
        eventIn.description = event.description || eventIn.description;
        eventIn.date = event.date || eventIn.date;
        eventIn.localDate = event.localDate || eventIn.localDate;
        eventIn.globalReminder = event.globalReminder || eventIn.globalReminder;
        eventIn.privateReminder = event.privateReminder || eventIn.privateReminder;

        // Dates for next reminder
        const {globalDate, privateDate} = getDateReminder(event);
        eventIn.globalReminderDate = globalDate;
        eventIn.privateReminderDate = privateDate;

        context.bindings.eventOut = eventIn;

        // Delete session from cache
        await RedisClient.del(req.body.userId);
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
          eventId: eventIn.id,
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
function getDateReminder(event) {
  // Date for next global reminder
  const eventDate = event.date;
  const privateReminder = event.privateReminder;
  const days = Number.parseInt(event.globalReminder);

  const globalDate = new Date(Date.now());
  const index = event.localDate.indexOf('GMT') + 3;

  let timezoneOffset = 0;
  if (index < event.localDate.length) {
    timezoneOffset = Number.parseInt(event.localDate.substring(index));
  }

  globalDate.setUTCDate(globalDate.getUTCDate() + days);
  globalDate.setUTCHours(globalDate.getUTCHours() + timezoneOffset);
  globalDate.setUTCHours(0, 0);
  // Date for next private reminder
  const privateDate = new Date(eventDate);
  const hours = Math.floor(privateReminder / 60);
  const min = privateReminder % 60;
  privateDate.setUTCHours(privateDate.getUTCHours() - hours);
  privateDate.setUTCMinutes(privateDate.getUTCMinutes() - min);

  return {
    globalDate: globalDate,
    privateDate: privateDate,
  };
}

