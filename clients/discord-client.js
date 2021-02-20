'use strict';

const Discord = require('discord.js-light');
const client = new Discord.Client();
const gold = '#FFD700';

client.login(process.env.DISCORD_TOKEN);

class DiscordApi {
  static async sendPrivateMessage(userId, event) {
    const user = await client.users.fetch(userId);
    const embed = await message(event);

    user.send(embed);
  }

  static async sendPublicMessage(channelId, event) {
    const channel = await client.channels.fetch(channelId);
    const embed = await message(event);

    return channel.send(embed);
  }

  static async deleteMessage(channelId, messageId) {
    client.channels.fetch(channelId)
        .then((channel) => {
          channel.messages.delete(messageId);
        })
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

module.exports = DiscordApi;
