import { createUsers } from './CreateUser';
import { client } from "..";
import { INR_BALANCES } from '../dataStore';

export const onRamp =  async (data:any) => {
    console.log(data,"onRamp");
    const { userId, amount } = data;
    try {
        createUsers(userId); 
        //@ts-ignore
        INR_BALANCES[userId].balance += amount;
            await client.publish("onRamp", JSON.stringify({ status: 200 }));
    } catch (error) {
        await client.publish("onRamp", JSON.stringify({ 
            status: 500, 
            error: error instanceof Error ? error.message : "Unknown error" 
        }));
    }
}