const CosmosClient = new (require('../clients/cosmos-client'))('Events');
/*
  Set a new guild Object for the server(guild)
*/
module.exports = async function(context, req, guildIn) {
  if (req.body && req.body.guild) {
    // set guild document object
    if (guildIn[0]) {
      // update guild document object
      context.bindings.guildOut = guildIn[0];
      if (req.body.channel) {
        context.bindings.guildOut.channel = req.body.channel;
        const sqlQuery = {
          query: `SELECT * FROM Events e WHERE e.guild = @guild`,
          parameters: [
            {
              name: '@guild',
              value: req.body.guild,
            },
          ],
        };
        const eventOfGuild = (await CosmosClient.query(sqlQuery)).resources;
        for (const event of eventOfGuild) {
          event.channel = req.body.channel;
        }
        context.bindings.eventsUpdated = eventOfGuild;
      }
      if (req.body.prefix) {
        context.bindings.guildOut.prefix = req.body.prefix;
      }
      if (req.body.timezone) {
        context.bindings.guildOut.timezone = req.body.timezone;
      }
    } else {
      // create a new guild document object
      context.bindings.guildOut = {
        guild: req.body.guild,
        channel: req.body.channel || null,
        prefix: req.body.prefix || '!',
        timezone: 0,
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
