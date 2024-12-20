import { client } from "..";
import { ORDERBOOK } from "../dataStore";
import { publishOrderbookUpdate } from "../utils/Orderbook";

export const createStockSymbol = async (data: any) => {
  const { stockSymbol } = data;

  try {
    //@ts-ignore
    if (!ORDERBOOK[stockSymbol]) {
      //@ts-ignore
      ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
      await client.publish("createStockSymbol", JSON.stringify({ status: 200 }));
    } else {
      await client.publish("createStockSymbol", JSON.stringify({ status: 400 }));
    }
    await publishOrderbookUpdate(stockSymbol);
  } catch (error) {
    await client.publish(
      "createStockSymbol",
      JSON.stringify({
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    );
  }
};
