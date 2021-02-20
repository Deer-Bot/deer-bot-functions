'use strict';
const CosmosClient = new (require('../clients/cosmos-client'))('Events');

/*
  Retrieves the events created by the author
*/
module.exports = async function(context, req) {
  if (req.query.authorId && req.query.number) {
    const sqlQuery = {
      query: `SELECT * FROM Events e WHERE e.authorId = @authorId AND e.date >= GetCurrentDateTime() ORDER BY e.date OFFSET @offset LIMIT @number`,
      parameters: [
        {
          name: '@authorId',
          value: req.query.authorId,
        },
        {
          name: '@offset',
          value: Number.parseInt(req.query.offset) || 0,
        },
        {
          name: '@number',
          value: Number.parseInt(req.query.number) + 1,
        },
      ],
    };

    const numberRequested = Number.parseInt(req.query.number);
    const {resources} = await CosmosClient.query(sqlQuery);
    const hasNext = resources.length === numberRequested + 1;

    if (resources.length === numberRequested + 1) {
      resources.pop();
    }

    return {
      status: 200,
      body: {
        events: resources,
        hasNext: hasNext,
      },
    };
  } else {
    return {
      status: 400,
      body: {
        message: 'Request is missing some parameters',
      },
    };
  }
};
