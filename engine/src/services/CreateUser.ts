import { client } from "..";
import { createUser } from "../dataStore";

export const createUsers =  async (data:any) => {
    console.log(data,"createUSer");
    const { userId } = data
    createUser(userId);
    // client.publish("problem_done", JSON.stringify({ problemId, status: "TLE" }));
}