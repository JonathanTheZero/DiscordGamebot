import { Client, TextChannel } from "discord.js";
import { user } from "../../utils/interfaces";
import { getAllUsers, updateValueForUser, editCLSLoyality } from "../../utils/databasehandler";
import { rangeInt } from "../../utils/utils";
import * as config from "../../static/config.json";

export async function dailyPayout(client: Client) {
    const users: user[] = await getAllUsers();
    const payoutChannel = <TextChannel>client.channels.get(config.payoutChannel)!;
    for (const u of users) {
        if (!u.clientStates.length) continue;
        for(let i = 0; i < u.clientStates.length; i++) editCLSLoyality(u._id, i, -(Math.random() * .7), "$inc");

    }

    const plagueAffected: user[] = users.sort(() => 0.5 - Math.random()).slice(0, rangeInt(0, 1));
    const names: string = plagueAffected.map<string>(el => el.tag).join(", ");
    for (const p of plagueAffected) {
        const rate = Math.random() * .5 * (1 - p.upgrades.hospitals / 10);
        updateValueForUser(p._id, "population", -Math.floor(p.resources.population * rate), "$inc");
        try {
            client.users.get(p._id)?.send(
                `A plague broke out in your Utopia, which killed ${rate.toLocaleString("en", { style: "percent" })} of your population ` +
                `(${Math.floor(p.resources.population * rate).commafy()} people).\n` +
                `You can lower the impact with buying hospitals in the population store.`
            );
        } catch { }
    }
    payoutChannel.send({
        embed: {
            color: names ? 0xFF0000 : 0x00FF00,
            title: "The daily reset has been made.",
            description: ((names ? `The Utopias of ${names} have been struck by plagues.` : "None Utopias have been struck by plagues today.") + "\n" +
                "Your client states gained some more autnomy."),
            timestamp: new Date()
        }
    });
}