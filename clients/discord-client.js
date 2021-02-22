'use strict';

const Discord = require('discord.js-light');
const client = new Discord.Client();
const gold = '#FFD700';

client.login(process.env.DISCORD_TOKEN);

class DiscordApi {
  static async sendPrivateMessage(userId, event) {
    const user = await client.users.fetch(userId);
    const embeds = await privateMessage(event);

    return user.send(embeds[0]).then(() => user.send(embeds[1]));
  }

  static async sendPublicMessage(channelId, event) {
    const channel = await client.channels.fetch(channelId);
    const embed = await message(event);

    return channel.send(embed);
  }

  static async deleteMessage(channelId, messageId) {
    client.channels.fetch(channelId)
        .then((channel) => channel.messages.delete(messageId))
        .catch((err) => {});
  }
}

/**
 *  Create the message for the passed event
 * @param {Object} event
 */
const message = async (event) => {
  const guild = await client.guilds.fetch(event.guildId);
  const member = await guild.members.fetch(event.authorId);

  const embed = new Discord.MessageEmbed();
  embed.setTitle(event.name)
      .setDescription(event.description)
      .setAuthor(member.displayName, member.user.displayAvatarURL())
      .addField('Date', event.localDate)
      .setColor(gold);

  return embed;
};

/**
 *  Create the message for the passed event
 * @param {Object} event
 */
const privateMessage = async (event) => {
  const guild = await client.guilds.fetch(event.guildId);
  const member = await guild.members.fetch(event.authorId);

  const reminderEmbed = new Discord.MessageEmbed();
  reminderEmbed.setTitle(`The **'${event.name}'** event is about to start on the **${guild.name}** server.\n\nDon't miss it! ⏰`)
      .setDescription('See event details below.')
      .setColor('5B50FF');

  const eventEmbed = new Discord.MessageEmbed();
  eventEmbed.setTitle(event.name)
      .setDescription(event.description)
      .setAuthor(member.displayName, member.user.displayAvatarURL())
      .addField('Date', event.localDate)
      .setColor(gold);

  return [reminderEmbed, eventEmbed];
};

module.exports = DiscordApi;
