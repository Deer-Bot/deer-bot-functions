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
      // TODO --
    } else {
      for (const event of events) {
        try {
          const message = await DiscordApi.sendPublicMessage(event.channel, event);
          message.react(confirmEmoji);
          DiscordApi.deleteMessage(event.channel, event.messageId);
          RedisClient.del(event.messageId)
              .catch((err) => {});
          // Update next global reminder date
          event.globalReminderDate = getNewGlobalReminderDate(Number.parseInt(event.globalReminder));
          event.messageId = message.id;
        } catch (error) {
          context.log(error);
        }
      }
      // Update of the events
      context.bindings.updateEvents = events;
    }
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
 * @param {number} days
 * @return {Date}
 */
function getNewGlobalReminderDate(days) {
  const globalDate = new Date(Date.now());
  globalDate.setUTCDate(globalDate.getDate() + days);
  globalDate.setUTCHours(0, 0);

  return globalDate;
}
