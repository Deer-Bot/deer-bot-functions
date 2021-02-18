module.exports = async function(context, req, eventIn) {
  if (req.query.messageId) {
    const [event] = eventIn;

    if (event) {
      return {
        status: 200,
        body: {
          event: event,
        },
      };
    } else {
      return {
        status: 200,
        body: {
          event: null,
        },
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
