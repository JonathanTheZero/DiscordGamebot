import { Message } from "discord.js";
import { user } from "../../utils/interfaces";
import { getUser } from "../../utils/databasehandler";
import * as config from "../../static/config.json";
import "../../utils/utils";

export async function singleStateOverview(message: Message, args: string[]) {
    const user: user = await getUser(message.author.id);
    if (!user) return message.reply("you haven't created an account yet, please use `.create`!");
    const index = user.clientStates.findIndex(el => el.name === args[0]);
    if (index === -1) return message.reply("you have no client state called " + args[0]);
    const cls = user.clientStates[index];
    return message.channel.send({
        embed: {
            color: parseInt(config.properties.embedColor),
            title: args[0],
            fields: [
                {
                    name: "Money",
                    value: `This state owns ${cls.resources.money.commafy()} money`,
                    inline: true
                },
                {
                    name: "Steel",
                    value: `This state owns ${cls.resources.steel.commafy()} steel`,
                    inline: true
                },
                {
                    name: "Oil",
                    value: `This state owns ${cls.resources.oil.commafy()} oil`,
                    inline: true
                },
                {
                    name: "Food",
                    value: `This state owns ${cls.resources.food.commafy()} food`,
                    inline: true
                },
                {
                    name: "Population",
                    value: `This state has a population of ${cls.resources.population.commafy()}`,
                    inline: true
                },
                {
                    value: "\u200b",
                    name: "\u200b",
                    inline: true
                },
                {
                    name: "Steel Mines",
                    value: `This state owns ${cls.upgrades.mines} mines (xx per day)`,
                    inline: true
                },
                {
                    name: "Oil Rigs",
                    value: `This state owns ${cls.upgrades.mines} rigs`,
                    inline: true
                },
                {
                    name: "Farms",
                    value: `This state owns ${cls.upgrades.farms} farms`,
                    inline: true
                },
            ],
            footer: config.properties.footer,
            timestamp: new Date()
        }
    });
}