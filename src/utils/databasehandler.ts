import { user, alliance, updateUserQuery, updateAllianceQuery } from "./interfaces";
import * as mongodb from "mongodb";

const url: string = "mongodb://localhost:27017/mydb";
const client = new mongodb.MongoClient(url);
const dbName = "mydb";

export async function addUsers(newUsers: user[]): Promise<void> {
    if (!newUsers || newUsers.length === 0) return;
    let result = await client.db(dbName).collection("users").insertMany(newUsers);
    if (result) console.log("Successfully added");
}

export async function getUser(_id: string): Promise<user> {
    let result = await client.db(dbName).collection("users").findOne({ _id });
    return result;
}

export async function getAlliance(name: string): Promise<alliance | null> {
    return await client.db(dbName).collection("alliances").findOne({ name });
}

export async function updateValueForUser(_id: string, mode: "money" | "food" | "population" | "votingStreak" | "loan", newValue: number, updateMode?: "$inc" | "$set"): Promise<void>;
export async function updateValueForUser(_id: string, mode: "lastCrime" | "lastWorked" | "lastVoted", newValue: number): Promise<void>;
export async function updateValueForUser(_id: string, mode: "alliance", newValue: string | null): Promise<void>;
export async function updateValueForUser(_id: string, mode: "tag", newValue: string): Promise<void>;
export async function updateValueForUser(_id: string, mode: "allianceRank", newValue: "M" | "C" | "L" | null): Promise<void>;
export async function updateValueForUser(_id: string, mode: "autoping" | "payoutDMs", newValue: boolean): Promise<void>;
export async function updateValueForUser(_id: string, mode: updateUserQuery, newValue: any, updateMode: "$inc" | "$set" = "$set") {
    let newQuery = {};
    if (mode === "money")
        newQuery = { [updateMode]: { money: <number>newValue } };
    else if (mode === "allianceRank")
        newQuery = { $set: { allianceRank: <string>newValue } };
    else if (mode === "alliance")
        newQuery = { $set: { alliance: <string>newValue } };
    else if (mode === "food")
        newQuery = { [updateMode]: { "resources.food": <number>newValue } };
    else if (mode === "autoping")
        newQuery = { $set: { autoping: <boolean>newValue } };
    else if (mode === "loan")
        newQuery = { [updateMode]: { loan: <number>newValue } };
    else if (mode === "population")
        newQuery = { [updateMode]: { "resources.population": <number>newValue } };
    else if (mode === "tag")
        newQuery = { $set: { tag: <string>newValue } };
    else if (mode === "payoutDMs")
        newQuery = { $set: { payoutDMs: <boolean>newValue } };
    else if (mode === "lastCrime")
        newQuery = { $set: { lastCrime: <number>newValue } };
    else if (mode === "lastWorked")
        newQuery = { $set: { lastWorked: <number>newValue } };
    else if (mode === "lastVoted")
        newQuery = { $set: { lastWorked: <number>newValue } };
    else if (mode === "votingStreak")
        newQuery = { [updateMode]: { votingStreak: <number>newValue } };
    else
        throw new Error("Invalid parameter passed");

    client.db(dbName).collection("users").updateOne({ _id }, newQuery, err => {
        if (err) throw err;
    });
}

export async function updateValueForAlliance(name: string, mode: "money" | "level", newValue: number, updateMode: "$inc" | "$set"): Promise<void>;
export async function updateValueForAlliance(name: string, mode: "leader", newValue: { _id: string, tag: string }): Promise<void>;
export async function updateValueForAlliance(name: string, mode: "public", newValue: boolean): Promise<void>;
export async function updateValueForAlliance(name: string, mode: "name", newValue: string): Promise<void>;
export async function updateValueForAlliance(name: string, mode: updateAllianceQuery, newValue: any, updateMode: "$inc" | "$set" = "$set") {
    let newQuery = {};
    if (mode === "money")
        newQuery = { [updateMode]: { money: <number>newValue } };
    else if (mode === "level")
        newQuery = { [updateMode]: { level: <number>newValue } };
    else if (mode === "public")
        newQuery = { $set: { public: <boolean>newValue } };
    else if (mode === "name")
        newQuery = { $set: { name: <string>newValue } };
    else if (mode === "tax")
        newQuery = { $set: { tax: <number>newValue } };
    else if (mode === "leader")
        newQuery = { $set: { leader: { _id: newValue._id, tag: newValue.tag } } };

    client.db(dbName).collection("alliances").updateOne({ name }, newQuery, err => {
        if (err) throw err;
    });
}

export async function addUpgrade(_id: string, upgrade: string, type: "population" | "misc"): Promise<void> {
    let userUpgrades: user["upgrades"] = (await getUser(_id)).upgrades;
    userUpgrades[type].push(upgrade);
    client.db(dbName).collection("users").updateOne({ _id }, { $set: { upgrades: userUpgrades } });
}

export async function addPF(_id: string, upgrade: "nf" | "sf" | "sef" | "if"): Promise<void> {
    let pfs: user["upgrades"]["pf"] = (await getUser(_id)).upgrades.pf;
    pfs[upgrade] += 1;
    client.db(dbName).collection("users").updateOne({ _id }, { $set: { upgrades: pfs } });
}

export async function addAlliance(alliance: alliance): Promise<void> {
    if (!alliance) return;
    let result = await client.db(dbName).collection("alliances").insertOne(alliance);
    if (result) console.log(`Successfully added ${alliance.name}`);
}

export async function addAllianceUpgrade(name: string, upgrade: "af" | "pf" | "mf"): Promise<void> {
    let upgrades: alliance["upgrades"] = (await getAlliance(name) as alliance)?.upgrades;
    upgrades[upgrade] += 1;
    client.db(dbName).collection("alliances").updateOne({ name }, { $set: { upgrades } });
}

export async function editAllianceArray(name: string, array: "members" | "coLeaders" | "invitedUsers", operation: "$push" | "$pull" = "$push", value: string) {
    client.db(dbName).collection("alliances").updateOne({ name }, { [operation]: { [array]: value } });
}

export async function getAllUsers(): Promise<user[]> {
    return client.db(dbName).collection("users").find({}).toArray();
}

export async function getAllAlliances(): Promise<alliance[]> {
    return client.db(dbName).collection("alliances").find({}).toArray();
}

export async function deleteUser(_id: string) {
    client.db(dbName).collection("users").deleteOne({ _id });
}

export async function deleteAlliance(name: string) {
    client.db(dbName).collection("alliances").deleteOne({ name });
}

export async function customUpdateQuery(collection: string, filter: { [key: string]: any }, update: { [key: string]: any }) {
    client.db(dbName).collection(collection).updateMany(filter, update, err => {
        if (err) throw err;
    });
}

export function connectToDB(): void {
    client.connect(err => {
        if (err) throw err;
        console.log("Successfully connected");

        client.db(dbName).createCollection("users");
        client.db(dbName).createCollection("alliances");
    });
}