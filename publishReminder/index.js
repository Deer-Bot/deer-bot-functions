'use strict';
const DiscordApi = require('../clients/discord-client');
const RedisClient = new (require('../clients/redis-client'))(2);
const confirmEmoji = '✅';

/*
  Publishes the passed events on the dm or on the selected channel
*/
module.exports = async function(context, req) {
  if (req.body && req.body.events && req.body.isPrivate != undefined) {
    const events = req.body.events;
    if (req.body.isPrivate) {
      for (const event of events) {
        if (event.participants) {
          for (const participant of event.participants) {
            try {
              await DiscordApi.sendPrivateMessage(participant, event);
            } catch (error) {
              context.log(error);
            }
          }
        }
        event.privateReminderDate = event.date;
      }
    } else {
      for (const event of events) {
        try {
          if (event.channelId == '-1') {
            continue;
          }
          const message = await DiscordApi.sendPublicMessage(event.channelId, event);
          message.react(confirmEmoji);
          // Remove old message and remove his id from cache
          DiscordApi.deleteMessage(event.channelId, event.messageId);
          RedisClient.del(event.messageId)
              .catch((err) => {});
          // Update next global reminder date
          event.globalReminderDate = getNewGlobalReminderDate(event);
          event.messageId = message.id;
        } catch (error) {
          context.log(error);
        }
      }
    }
    // Update of the events
    context.bindings.updateEvents = events;
  } else {
    return {
      status: 400,
      body: {
        message: 'Request is missing some parameters',
      },
    };
  }
};

/**
 *  Utility function to calculate next date
 * @param {Object} event
 * @return {Date}
 */
function getNewGlobalReminderDate(event) {
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

  return globalDate;
}
