import * as Discord from "discord.js";
import * as config from "./config.json";
const DBL = require("dblapi.js");
import "./utils/utils";
import { allianceHelpMenu, miscHelpMenu, helpMenu, generalHelpMenu, modHelpMenu } from "./commands/help";
import { createUser, createAlliance } from "./commands/create";
import { addUsers, getUser, connectToDB, addAlliance, updateValueForUser, deleteUser } from "./utils/databasehandler";
import { statsEmbed } from "./commands/stats";
import { kick } from "./commands/moderation/yeet";
import { ban } from "./commands/moderation/ban";
import { purge } from "./commands/moderation/purge";
import { user } from "./utils/interfaces";
import { bet } from "./commands/bet";
import { loancalc } from "./commands/loans";
import { leaderboard } from "./commands/leaderboard";
import { buy } from "./commands/buy";
import { payout, alliancePayout } from "./commands/payouts";
import { kill } from "./commands/populations";
import { add } from "./commands/moderation/add";
import { send } from "./commands/send";
import { joinAlliance } from "./commands/alliances/join";
import { leaveAlliance } from "./commands/alliances/leave";
import { promote } from "./commands/alliances/promote";
import { demote } from "./commands/alliances/demote";
import { toggleStatus } from "./commands/alliances/setpublic";

const express = require('express');
const app = express();
app.use(express.static('public'));
var server = require('http').createServer(app);


const client = new Discord.Client();

app.get('/', (request: any, response: { sendFile: (arg0: string) => void; }) => {
    response.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});

if (config.dbl) {
    const dbl = new DBL(config.dbl.token, {
        webhookServer: listener,
        webhookAuth: config.dbl.auth
    }, client);
    dbl.webhook.on('ready', (hook: { hostname: any; port: any; path: any; }) => console.log(`Webhook running at http://${hook.hostname}:${hook.port}${hook.path}`));

    dbl.webhook.on('vote', (vote: any) => {

    });
}



console.log("My prefix is", config.prefix);

client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    client.user.setActivity(`.help | Now with voting streaks!`);
    connectToDB();
});


client.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`.help | ${client.users.size} users on ${client.guilds.size} servers`);
});


client.on("guildDelete", guild => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`.help | ${client.users.size} users on ${client.guilds.size} servers`);
});


client.on("message", async message => {
    if (message.content.indexOf(config.prefix) !== 0 || message.author.bot) return;

    var args: Array<string> = message.content.slice(config.prefix.length).trim().split(/ +/g);
    if (!args || args.length === 0) return;
    const command: string | undefined = args?.shift()?.toLowerCase();

    if (command === "ping") {
        const m = await message.channel.send("Ping?") as Discord.Message;
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }

    else if (command === "say") {
        const sayMessage = args.join(" ");
        message.delete().catch(null);
        message.channel.send(sayMessage);
    }

    else if (command === "kick" || command === "yeet") kick(message, args);

    else if (command === "ban") ban(message, args);

    else if (command === "purge" || command === "clear") purge(message, args);

    else if (command === "vote") {
        let u: user = await getUser(message.author.id);
        message.channel.send({
            embed: {
                color: parseInt(config.properties.embedColor),
                title: `Your voting streak: ${u.votingStreak}`,
                description: "As a reward for voting you will get your streak mulitplied with 15000 as money!\n" +
                    "You can increase your voting streak every 12h." +
                    "If you don't vote for more than 24h, you will lose your streak.\n\n" +
                    `Click [here](https://top.gg/bot/619909215997394955/vote) to vote\n` +
                    `You can vote again ${(u.lastVoted === 0 || Date.now() - u.lastVoted * 1000 > 43200000) ? "**now**" : "in" + new Date((43200 - (Math.floor(Date.now() / 1000) - u.lastVoted)) * 1000).toISOString().substr(11, 8)}`
            }
        });
    }

    else if (command === "bet" || command === "coinflip") bet(message, args);

    else if (command === "help") {
        if (["general", "g"].includes(args[0])) {
            message.channel.send({ embed: generalHelpMenu });
        }
        else if (["alliance", "alliances", "a"].includes(args[0])) {
            message.channel.send({ embed: allianceHelpMenu });
        }
        else if (args[0] == "misc") {
            message.channel.send({ embed: miscHelpMenu });
        }
        else if (args[0] == "mod") {
            message.channel.send({ embed: modHelpMenu });
        }
        else {
            message.channel.send({ embed: helpMenu });
        }
    }

    else if (command === "create") {
        let data = createUser(message);
        addUsers([data]);
        message.reply("You succesfully created an acoount");
    }

    else if (["loancalc", "lc"].includes(command as string))
        loancalc(message, args, await getUser(message.author.id));

    else if (command === "me" || command === "stats") {
        statsEmbed(message, args, client);
    }

    else if (command === "createalliance") {
        if (!args[0]) return message.reply("please specify a name for your alliance");
        let user: user = await getUser(message.author.id);
        if (!user)
            return message.reply("you haven't created an account yet, please use the `create` command.");
        else if (user.alliance != null)
            return message.reply("you can't create your own alliance, because you already joined one. Leave your alliance with `.leavealliance` first.");

        await addAlliance(createAlliance(args.join(" "), message));
        updateValueForUser(message.author.id, "alliance", args.join(" "));
        updateValueForUser(message.author.id, "allianceRank", "L");
        message.reply("You are now the leader of " + args.join(" "));
    }

    else if (command === "joinalliance" || command === "join") joinAlliance(message, args);

    else if (command === "leavealliance" || command === "leave") leaveAlliance(message, args);

    else if (command === "lb" || command === "leaderboard")
        leaderboard(message, args);

    else if (command === "invitelink")
        return message.reply("Add me to your server using this link: " + config.properties.inviteLink);

    else if (command === "server")
        return message.reply("join the official Utopia server for special giveaways, support, bug reporting and more here: " + config.serverInvite);

    else if (command === "buy")
        buy(message, args);

    else if (command === "payout")
        payout(message, args);

    else if (command === "alliancepayout")
        alliancePayout(message, args);

    else if (command === "kill")
        kill(message, args);

    else if (command === "add")
        add(message, args);

    else if (command === "send")
        send(message, args);

    else if (command === "delete") {
        deleteUser(message.author.id);
        return message.reply("you have successfully deleted your account!");
    }

    else if (command === "promote") {
        let user: user = await getUser(message.author.id);
        let member: user;
        try {
            member = await getUser(message.mentions.users.first().id);
        }
        catch {
            member = await getUser(args[0]);
        }
        if (!user) return message.reply("you haven't created an account yet, please use the `create` command.");
        if (typeof args[0] === 'undefined') return message.reply("please supply a username with `.promote <mention/ID>`.");
        if (member._id == message.author.id) return message.reply("you can't promote yourself!");
        if (user.allianceRank != "L") return message.reply("only the leader can promote members.");
        return message.reply(await promote(user, member));
    }

    else if (command === "demote") {
        let user: user = await getUser(message.author.id);
        let member: user;
        try {
            member = await getUser(message.mentions.users.first().id);
        }
        catch {
            member = await getUser(args[0]);
        }
        if (!user) return message.reply("you haven't created an account yet, please use the `create` command.");
        if (member._id == message.author.id) return message.reply("you can't demote yourself!");
        if (typeof args[0] === 'undefined') return message.reply("please supply a username with `.demote <mention/ID>`.");
        if (user.allianceRank != "L") return message.reply("only the leader can demote members.");
        return message.reply(await demote(user, member));
    }

    else if (command === "setprivate") {
        let user: user = await getUser(message.author.id);
        if (!user) return message.reply("you haven't created an account yet, please use the `create` command.");
        if (!user.allianceRank) return message.reply("you haven't joined an alliance yet.");
        if (user.allianceRank != "M") return message.reply(await toggleStatus(user, false));
        return message.reply("Only the Leader and the Co-Leaders can set the alliance status");
    }

    else if(command === "setpublic"){
        let user: user = await getUser(message.author.id);
        if (!user) return message.reply("you haven't created an account yet, please use the `create` command.");
        if (!user.allianceRank) return message.reply("you haven't joined an alliance yet.");
        if (user.allianceRank != "M") return message.reply(await toggleStatus(user, true));
        return message.reply("Only the Leader and the Co-Leaders can set the alliance status");
    }

    else if(command === "upgradealliance" || command === "upalliance"){
    }
});

client.login(config.token);