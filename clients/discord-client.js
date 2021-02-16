'use strict';

const Discord = require('discord.js-light');
const client = new Discord.Client();
const gold = '#FFD700';

client.login(process.env.DISCORD_TOKEN);

class DiscordApi {
  static async sendPrivateMessage(userId, event) {
    const user = await client.users.fetch(userId);
    // TODO
    const embed = await message(event);
    user.send(embed);
  }

  static async sendPublicMessage(channelId, event) {
    const channel = await client.channels.fetch(channelId);
    // TODO
    const embed = await message(event);
    channel.send(embed);
  }
}

/**
 *  Create the message for the passed event
 * @param {Object} event
 */
const message = async (event) => {
  const guild = await client.guilds.fetch(event.guild);
  const member = await guild.members.fetch(event.author);
  const date = new Date(event.date);

  const embed = new Discord.MessageEmbed();
  embed.setTitle(event.name)
      .setDescription(event.description)
      .setAuthor(member.displayName, member.user.displayAvatarURL())
      .addField('Date', dateToString(date) )
      .setColor(gold);

  return embed;
};

// Utility functions
const pads = (s) => {
  return s < 10 ? `0${s}` : `${s}`;
};

const dateToString = (date) => {
  const dateString = [pads(date.getUTCDate()), pads(date.getUTCMonth() + 1), pads(date.getUTCFullYear())].join('-');
  return `${dateString} at ${date.getUTCHours()}:${pads(date.getUTCMinutes())}`;
};


module.exports = DiscordApi;
