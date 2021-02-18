module.exports = async function(context, req, eventIn) {
  if (req.body && req.body.userId && req.body.eventId && req.body.add !== undefined) {
    const [event] = eventIn;

    if (event) {
      if (event.participants === undefined) {
        event.participants = [];
      }
      const index = event.participants.indexOf(req.body.userId);
      if (req.body.add) {
        if (index == -1) {
          event.participants.push(req.body.userId);
        }
      } else {
        if (index != -1) {
          event.participants.splice(index, 1);
        }
      }

      context.bindings.eventOut = event;
      return {
        status: 200,
        body: {
          message: 'Participant set',
        },
      };
    }


    return {
      status: 404,
    };
  }

  return {
    status: 400,
    body: {
      message: 'Request is missing some parameters.',
    },
  };
};
