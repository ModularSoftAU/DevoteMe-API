import cron from 'node-cron';
import fetch from 'node-fetch';
import { MessageEmbed } from 'discord.js';

// 
// DAILY Cron Jobs [Firing at 7:00am]
// 
export default async function dailyCron(client) {
    const sendDevotionTask = cron.schedule('0 7 * * *', async function () {
        try {
            const devotionFetchURL = `${config.apiUrl}/devotion/get`;
            const devotionResponse = await fetch(devotionFetchURL);
            const devotionData = await devotionResponse.json();
            console.log(devotionData);

            const guild = client.guilds.cache.get(config.discord.guildID);
            const devotionChannel = guild.channels.cache.get(config.discord.channel.devotion);
            if (!devotionChannel) return console.log(`A Devotion channel does not exist.`);

            const embed = new MessageEmbed()
                .setTitle(`:ballot_box: Voting Winner :ballot_box:`)
                .setDescription(`The votes are in! **${topVoterEntry.username}** has gained Top Voter for this month with **${topVoterEntry.votes} votes**.\nThe votes have started again! Go to ${process.env.siteAddress}/vote to get started!`)
                .setColor('#cbff7c')
            devotionChannel.send({ embeds: [embed] });
        } catch (error) {
            console.log(error);
            return;
        }
    }, {
        scheduled: true,
        timezone: process.env.TZ
    });

    sendDevotionTask.start();
}