module.exports = async function(context, req, eventsIn) {
  const messageInfos = eventsIn.map((event) => event.messageInfo);
  return {
    status: 200,
    body: {
      messageInfos: messageInfos,
    },
  };
};
