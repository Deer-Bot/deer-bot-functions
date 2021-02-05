/*
  Set a new channel for the server(guild)
*/
module.exports = async function(context, req) {
  if (req.body && req.body.guild && req.body.channel) {
    // set guild document object
    if (context.bindings.guildIn[0]) {
      // update guild document object
      context.bindings.guildOut = context.bindings.guildIn[0];
      context.bindings.guildOut.channel = req.body.channel;
    } else {
      // create a new guild document object
      context.bindings.guildOut = {
        guild: req.body.guild,
        channel: req.body.channel,
        prefix: '!',
      };
    }

    return {
      status: '200',
      message: 'the channel has been correctly set',
    };
  } else {
    return {
      status: '400',
      message: 'Request has some parameters missing',
    };
  }
};
