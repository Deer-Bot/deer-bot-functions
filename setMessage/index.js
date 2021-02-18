module.exports = async function(context, req, eventIn) {
  if (req.body && req.body.eventId && req.body.messageId) {
    if (eventIn) {
      context.bindings.eventOut = eventIn;
      context.bindings.eventOut.messageId = req.body.messageId;
      return {
        status: 200,
        body: {
          message: 'Message correctly set',
        },
      };
    } else {
      return {
        status: 404,
      };
    }
  }

  return {
    status: 400,
    body: {
      message: 'Request is missing some parameters.',
    },
  };
};
