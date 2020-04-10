import { user, alliance, updateUserQuery, updateAllianceQuery } from "./interfaces";
export declare function addUsers(newUsers: user[]): Promise<void>;
export declare function getUser(_id: string): Promise<user>;
export declare function getAlliance(name: string): Promise<alliance | null>;
export declare function updateValueForUser(_id: string, mode: updateUserQuery, newValue: any, updateMode?: "$inc" | "$set"): Promise<void>;
export declare function updateValueForAlliance(name: string, mode: updateAllianceQuery, newValue: any, updateMode?: "$inc" | "$set"): Promise<void>;
export declare function addUpgrade(_id: string, upgrade: string, type: "population" | "misc"): Promise<void>;
export declare function addPF(_id: string, upgrade: "nf" | "sf" | "sef" | "if"): Promise<void>;
export declare function addAlliance(alliance: alliance): Promise<void>;
export declare function addAllianceUpgrade(name: string, upgrade: "af" | "pf" | "mf"): Promise<void>;
export declare function editAllianceArray(name: string, array: "members" | "coLeaders" | "invitedUsers", operation: "$push" | "$pull" | undefined, value: string): Promise<void>;
export declare function getAllUsers(): Promise<user[]>;
export declare function getAllAlliances(): Promise<alliance[]>;
export declare function deleteUser(_id: string): Promise<void>;
export declare function deleteAlliance(name: string): Promise<void>;
export declare function customUpdateQuery(collection: string, filter: {
    [key: string]: any;
}, update: {
    [key: string]: any;
}): Promise<void>;
export declare function connectToDB(): void;
