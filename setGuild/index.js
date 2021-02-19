const CosmosClient = new (require('../clients/cosmos-client'))('Events');

/*
  Set a new guild Object for the server(guild)
*/
module.exports = async function(context, req, guildIn) {
  if (req.body && req.body.guildId) {
    if (guildIn[0]) {
      // update guild document object
      context.bindings.guildOut = guildIn[0];

      if (req.body.channelId) {
        context.bindings.guildOut.channelId = req.body.channelId;

        const sqlQuery = {
          query: `SELECT * FROM Events e WHERE e.guildId = @guildId`,
          parameters: [
            {
              name: '@guildId',
              value: req.body.guildId,
            },
          ],
        };

        const eventOfGuild = (await CosmosClient.query(sqlQuery)).resources;
        for (const event of eventOfGuild) {
          event.channelId = req.body.channelId;
        }
        context.bindings.eventsUpdated = eventOfGuild;
      }

      if (req.body.prefix) {
        context.bindings.guildOut.prefix = req.body.prefix;
      }

      if (req.body.timezoneOffset) {
        context.bindings.guildOut.timezoneOffset = req.body.timezoneOffset;
      }
    } else {
      // create a new guild document object
      context.bindings.guildOut = {
        guildId: req.body.guildId,
        channelId: req.body.channelId || null,
        prefix: req.body.prefix || '!',
        timezoneOffset: 0,
      };
    }

    return {
      status: '200',
      body: {
        message: 'Guild has been correctly updated',
      },
    };
  } else {
    return {
      status: '400',
      body: {
        message: 'Request has some parameters missing',
      },
    };
  }
};
