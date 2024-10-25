import { client } from "..";
import { ORDERBOOK } from "../dataStore";

export const publishOrderbookUpdate = async (stockSymbol: string) => {
  try {
    const orderbookUpdate = {
      stockSymbol,
      orderbook: ORDERBOOK[stockSymbol]
    };
    await client.publish('orderbook', JSON.stringify(orderbookUpdate));
  } catch (error) {
    console.error('Error publishing orderbook update:', error);
  }
};