'use strict';
const axios = require('axios');
const pageSize = process.env.EVENT_BATCH_SIZE;
const functionEndpoint = process.env.PUBLISH_FUNCTION_URL;

/*
  Private Reminder
*/
module.exports = async function(context, myTimer, eventsToRemind) {
  const size = eventsToRemind.length;

  for (let i = 0; i < size; i += pageSize) {
    const singlePage = eventsToRemind.slice(i, i + pageSize);
    axios.post(functionEndpoint, {
      events: singlePage,
      isPrivate: true,
    }).catch((err) => {});
  }
};
