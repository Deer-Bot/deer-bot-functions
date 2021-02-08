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
      }
      if (req.body.prefix) {
        context.bindings.guildOut.prefix = req.body.prefix;
      }
    } else {
      // create a new guild document object
      context.bindings.guildOut = {
        guild: req.body.guild,
        channel: req.body.channel || null,
        prefix: req.body.prefix || '!',
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