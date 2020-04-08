"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = __importStar(require("discord.js"));
const config_json_1 = require("./config.json");
const utils_1 = require("./utils");
const help_1 = require("./modules/help");
const client = new Discord.Client();
console.log("My prefix is", config_json_1.prefix);
client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    client.user.setActivity(`.help | Now with voting streaks!`);
});
client.on("message", async (message) => {
    var _a;
    if (message.content.indexOf(config_json_1.prefix) !== 0 || message.author.bot)
        return;
    var args = message.content.slice(config_json_1.prefix.length).trim().split(/ +/g);
    if (!args || args.length === 0)
        return;
    const command = (_a = args === null || args === void 0 ? void 0 : args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (command === "help") {
        if (["general", "g"].includes(args[0])) {
            message.channel.send({ embed: help_1.generalHelpMenu });
        }
        else if (["alliance", "alliances", "a"].includes(args[0])) {
            message.channel.send({ embed: help_1.allianceHelpMenu });
        }
        else if (args[0] == "misc") {
            message.channel.send({ embed: help_1.miscHelpMenu });
        }
        else if (args[0] == "mod") {
            message.channel.send({ embed: help_1.modHelpMenu });
        }
        /*else if(["battle", "battles", "b"].includes(args[0])){
          message.channel.send({ embed: battle.battleHelpEmbed });
        }*/
        else {
            message.channel.send({ embed: help_1.helpMenu });
        }
    }
});
client.login(config_json_1.token);
async function reminder(message, duration, preText, postText) {
    message.channel.send(preText);
    await utils_1.Sleep(duration);
    message.reply(postText);
}