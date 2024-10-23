import { client } from "..";
import {  INR_BALANCES } from "../dataStore";

export const cancel = async (data: any) => {
    const { userId } = data;
    try {
        //@ts-ignore
        if (!INR_BALANCES[userId]) {
        //@ts-ignore
            INR_BALANCES[userId] = { balance: 0, locked: 0 };
            await client.publish("createUser", JSON.stringify({ status: 200 }));
        } else {
            await client.publish("createUser", JSON.stringify({ status: 400 }));
        }
    } catch (error) {
        await client.publish("createUser", JSON.stringify({ 
            status: 500, 
            error: error instanceof Error ? error.message : "Unknown error" 
        }));
    }
};