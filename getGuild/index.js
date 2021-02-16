'use strict';
/*
  Get the guild document with the passed guild ID
*/
module.exports = async function(context, req, guildIn) {
  if (guildIn[0]) {
    return {
      status: '200',
      body: {
        guild: guildIn[0],
        message: 'Guild found',
      },
    };
  }

  return {
    status: '200',
    body: {
      guild: null,
      message: 'Guild not found',
    },
  };
};
