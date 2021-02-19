/* eslint-disable no-unused-vars */
const deleteExpiredStoredProcedure = {
  id: 'DeleteExpiredEvents',
  serverScript: function(events) {
    events = JSON.parse(events);
    if (!events) throw new Error('The array is undefined or null.');

    const collection = getContext().getCollection();
    let deleteCount = 0;
    const numItems = events.length;

    if (numItems == 0) {
      getContext().getResponse().setBody({deleted: deleteCount});
      return;
    }

    tryDelete(events[deleteCount], callback);

    function tryDelete(event, callback) {
      const isAccepted = collection.deleteDocument(event._self, {}, callback);

      if (!isAccepted) getContext().getResponse().setBody({deleted: deleteCount});
    }

    function callback(err, item, options) {
      if (err) {
        const errors = JSON.parse(err.message).Errors;
        getContext().getResponse().setBody({deleted: deleteCount, errors: errors});
        return;
      }
      deleteCount++;
      if (deleteCount >= numItems) {
        getContext().getResponse().setBody({deleted: deleteCount});
      } else {
        tryDelete(events[deleteCount], callback);
      }
    }
  },
};
