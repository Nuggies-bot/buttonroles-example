// require Nuggies
const Nuggies = require('nuggies');
const Discord = require('discord.js');
/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {String[]} args
 */

module.exports.run = async (client, interaction, args) => {
	const brmanager = new Nuggies.buttonroles();
	interaction.reply('Send messages in `roleID color label emoji` syntax! Once finished say `done`.');

	/**
	 * @param {Discord.Message} m
	 */
	const filter = m => m.author.id === interaction.user.id;
	const collector = interaction.channel.createMessageCollector({ filter, max: 25 });

	collector.on('collect', async (msg) => {
		if (!msg.content) return interaction.channel.send('Invalid syntax');
		if (msg.content.toLowerCase() == 'done') return collector.stop('DONE');
		const colors = ['PRIMARY', 'SECONDARY', 'DANGER', 'SUCCESS'];
		if (!msg.content.split(' ')[0].match(/[0-9]{18}/g) || !colors.includes(msg.content.split(' ')[1])) return interaction.channel.send('Invalid syntax');

		const role = msg.content.split(' ')[0];
		// const role = message.guild.roles.cache.get(roleid);
		if (!role) return interaction.channel.send('Invalid role');

		const color = colors.find(color => color == msg.content.split(' ')[1]);
		if (!color) return interaction.channel.send('Invalid color');

		const label = msg.content.split(' ').slice(2, msg.content.split(' ').length - 1).join(' ');

		const reaction = (await msg.react(msg.content.split(' ').slice(msg.content.split(' ').length - 1).join(' ')).catch(/*() => null*/console.log));

		const final = {
			role, color, label, emoji: reaction ? reaction.emoji.id || reaction.emoji.name : null,
		};
		brmanager.addrole(final);
	})

	collector.on('end', async (msgs, reason) => {
		if (reason == 'DONE') {
			const embed = new Discord.MessageEmbed()
				.setTitle('Button roles!')
				.setDescription('Click on the buttons to get the specific role or vice-versa')
				.setColor('RANDOM')
				.setTimestamp();
			Nuggies.buttonroles.create(client, { content: embed, role: brmanager, channelID: interaction.channel.id })
		}
	})
};

module.exports.config = {
	name: 'createbr',
	description: 'Creates button role!',
	usage: '/createbr',
	botPerms: [],
	userPerms: ['MANAGE_GUILD'],
	data: {
		name: 'createbr',
		defaultPermission: true,
		description: 'Creates buttonroles',
	},
};