// redisHelper.ts
import { client, pubSub } from './index';

export const RedisManager = async (
    queueData: object,
    channel: string,
    timeout = 5000
) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Subscribe first
            const messageHandler = async (message: string) => {
                await pubSub.unsubscribe(channel);
                resolve(JSON.parse(message));
            };
            
            await pubSub.subscribe(channel, messageHandler);
            
            // Push to queue
            await client.lPush("engine", JSON.stringify(queueData));
            
            // Set timeout
            setTimeout(async () => {
                await pubSub.unsubscribe(channel);
                reject(new Error("Response timeout"));
            }, timeout);
        } catch (error) {
            await pubSub.unsubscribe(channel);
            reject(error);
        }
    });
};