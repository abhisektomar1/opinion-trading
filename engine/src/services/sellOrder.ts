import { client } from "..";
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../dataStore";
import { publishOrderbookUpdate } from "../utils/Orderbook";

export const sellOrder = async (data: any) => {
  const { userId, stockSymbol, quantity, price, stockType } = data;
  try {
    if (!STOCK_BALANCES[userId] || !STOCK_BALANCES[userId][stockSymbol]) {
      return await client.publish("sellOrder", JSON.stringify({ status: 404 }));
    }

    if (!["yes", "no"].includes(stockType)) {
      return await client.publish("sellOrder", JSON.stringify({ status: 400 }));
    }
    //@ts-ignore
    const userStock = STOCK_BALANCES[userId][stockSymbol][stockType];

    if (userStock.quantity < quantity) {
      return await client.publish("sellOrder", JSON.stringify({ status: 400 }));
    }
    userStock.quantity -= quantity;
    userStock.locked += quantity;
    if (!ORDERBOOK[stockSymbol]) {
      ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
    }
    //@ts-ignore
    if (!ORDERBOOK[stockSymbol][stockType][price]) {
      //@ts-ignore
      ORDERBOOK[stockSymbol][stockType][price] = { total: 0, orders: {} };
    }
    //@ts-ignore
    const orderbookEntry = ORDERBOOK[stockSymbol][stockType][price];
    orderbookEntry.total += quantity;

    if (!orderbookEntry.orders[userId]) {
      orderbookEntry.orders[userId] = 0;
    }

    orderbookEntry.orders[userId] += quantity;

    await client.publish("sellOrder", JSON.stringify({ status: 200 }));
    await publishOrderbookUpdate(stockSymbol);
  } catch (error) {
    await client.publish(
      "createUser",
      JSON.stringify({
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    );
  }
};
