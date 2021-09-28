require('dotenv').config();
const Discord = require('discord.js');
// require Nuggies package
const Nuggies = require('nuggies');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS'] });
const fs = require('fs');
// login to the bot
client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
    console.log(`${client.user.tag} is online.`);
    client.application.commands.set(client.commands.map(x => x.config.data));
});

Nuggies.handleInteractions(client);

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdir('./commands/', (err, files) => {
    if (err) console.log(err);
    const file = files.filter(f => f.split('.').pop() === 'js');
    if (file.length < 1) {
        console.log('No Commands.');
        return;
    }
    file.forEach(f => {
        const pull = require(`./commands/${f}`);
        client.commands.set(pull.config.name, pull);
    });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.guild) return;
    const cmd = interaction.commandName;
    const args = interaction.options;
    const command = client.commands.get(cmd);
    if (command) {
        if (!command.config.botPerms) return console.log("You didn't provide botPerms");
        if (!Array.isArray(command.config.botPerms)) return console.log('botPerms must be an array.');
        if (!command.config.userPerms) return console.log("You didn't provide userPerms.");
        if (!Array.isArray(command.config.userPerms)) return console.log('userPerms must be an array.')
        if (!interaction.guild.me.permissions.has(command.config.botPerms)) {
            const beauty = command.config.botPerms.join('\`, \`');
            const noBotPerms = new Discord.MessageEmbed()
                .setTitle('Missing Permissions')
                .setDescription(`I am missing these permissions: \`${beauty}\`.`)
                .setColor('RED');
            return interaction.reply({ embeds: [noBotPerms], ephemeral: true })
        }
        if (!interaction.member.permissions.has(command.config.userPerms)) {
            const beauty = command.config.userPerms.join('\`, \`');
            const noUserPerms = new Discord.MessageEmbed()
                .setTitle('Missing Permissions')
                .setDescription(`You are missing these permissions: \`${beauty}\`.`)
                .setColor('RED');
            return interaction.reply({ embeds: [noUserPerms], ephemeral: true });
        }

        command.run(client, interaction, args);
    }
});
