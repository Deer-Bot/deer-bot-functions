module.exports = async function(context, req) {
  if (req.body && req.body.guild && req.body.channel) {
    // set guild document object
    context.bindings.guild = {
      guild: req.body.guild,
      channel: req.body.channel,
    };

    context.bindings.res = {
      status: '200',
      message: 'the channel has been correctly set',
    };
  } else {
    context.bindings.res = {
      status: '400',
      message: 'Request has some parameters missing',
    };
  }
};
