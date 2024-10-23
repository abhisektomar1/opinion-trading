import { client } from "..";
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../dataStore";

export const buyOrder = async (data: any) => {
  const { userId, stockSymbol, quantity, price, stockType } = data;
  try {
    const totalCost = quantity * price;
    if (INR_BALANCES[userId].balance < totalCost) {
      return await client.publish(
        "buyOrder",
        
        JSON.stringify({ status: 400, message: "Insufficient INR balance" })
      );
    }
    // Lock the funds
    INR_BALANCES[userId].balance -= totalCost;
    INR_BALANCES[userId].locked += totalCost;

    // Get the current orders for the given stock type ('yes' or 'no')
    //@ts-ignore
    const stockOrderBook = ORDERBOOK[stockSymbol][stockType];
    let remainingQuantity = quantity; // Track the remaining quantity to be matched
    let totalMatchedCost = 0; // Total cost of the matched orders
    let matchedOrders = [];
    let bestMatchedPrice = Infinity;

    // Try to match with the lowest sell orders (best price for buyer)
    const sortedSellPrices = Object.keys(stockOrderBook)
      .map(Number)
      .sort((a, b) => a - b);

    for (const sellPrice of sortedSellPrices) {
      if (sellPrice > price || remainingQuantity === 0) {
        break; // No more matching, either sell price is higher than our buy price or we're done
      }

      const sellOrders = stockOrderBook[sellPrice];

      // For each sell order at this price, try to match as much as possible
      for (const sellerId in sellOrders.orders) {
        const sellQuantity = sellOrders.orders[sellerId];

        if (sellQuantity <= remainingQuantity) {
          // Fully match this sell order
          remainingQuantity -= sellQuantity;
          totalMatchedCost += sellQuantity * sellPrice;
          matchedOrders.push({
            sellerId,
            quantity: sellQuantity,
            price: sellPrice,
          });

          // Update seller's stock balance and remove the order
          //@ts-ignore
          STOCK_BALANCES[sellerId][stockSymbol][stockType].locked -=
            sellQuantity;
          INR_BALANCES[sellerId].balance += sellQuantity * sellPrice;
          delete sellOrders.orders[sellerId];

          bestMatchedPrice = Math.min(bestMatchedPrice, sellPrice);
        } else {
          // Partially match this sell order
          totalMatchedCost += remainingQuantity * sellPrice;
          matchedOrders.push({
            sellerId,
            quantity: remainingQuantity,
            price: sellPrice,
          });

          // Update the sell order to reflect the remaining quantity
          sellOrders.orders[sellerId] -= remainingQuantity;
          //@ts-ignore
          STOCK_BALANCES[sellerId][stockSymbol][stockType].locked -=
            remainingQuantity;
          INR_BALANCES[sellerId].balance += remainingQuantity * sellPrice;

          bestMatchedPrice = Math.min(bestMatchedPrice, sellPrice);
          remainingQuantity = 0;
          break;
        }
      }

      // Remove the price level from the order book if all orders are matched
      if (Object.keys(sellOrders.orders).length === 0) {
        delete stockOrderBook[sellPrice];
      }

      if (remainingQuantity === 0) {
        break; // Stop if all the buy order has been matched
      }
    }

    // Update the buyer's balance and stock holdings after matching
    INR_BALANCES[userId].locked -= totalCost; // Release all initially locked funds
    INR_BALANCES[userId].balance += totalCost - totalMatchedCost; // Refund unused INR
    if (!STOCK_BALANCES[userId]) STOCK_BALANCES[userId] = {};
    if (!STOCK_BALANCES[userId][stockSymbol])
      STOCK_BALANCES[userId][stockSymbol] = {
        yes: { quantity: 0, locked: 0 },
        no: { quantity: 0, locked: 0 },
      };
    //@ts-ignore
    STOCK_BALANCES[userId][stockSymbol][stockType].quantity +=
      quantity - remainingQuantity; // Add matched quantity to buyer

    if (remainingQuantity > 0) {
      // If there is still some quantity left, add it to the order book as a pending order
      if (!stockOrderBook[price]) {
        stockOrderBook[price] = { total: 0, orders: {} };
      }
      stockOrderBook[price].total += remainingQuantity;
      stockOrderBook[price].orders[userId] =
        (stockOrderBook[price].orders[userId] || 0) + remainingQuantity;

      // Lock the funds for the remaining quantity
      const remainingCost = remainingQuantity * price;
      INR_BALANCES[userId].balance -= remainingCost;
      INR_BALANCES[userId].locked += remainingCost;

      // Create a corresponding 'no' sell order if buying 'yes' below market price
      if (stockType === "yes" && price < Math.min(...sortedSellPrices)) {
        const noOrderBook = ORDERBOOK[stockSymbol]["no"];
        if (!noOrderBook[price]) {
          noOrderBook[price] = { total: 0, orders: {} };
        }
        noOrderBook[price].total += remainingQuantity;
        noOrderBook[price].orders[userId] =
          (noOrderBook[price].orders[userId] || 0) + remainingQuantity;
      }

      return await client.publish(
        "buyOrder",
        JSON.stringify({ status: 200, message: "Buy order placed and pending" })
      );
    } else {
      // Fully matched
      return await client.publish(
        "buyOrder",
        JSON.stringify({
          status: 201,
          message: `Buy order matched at best price ${bestMatchedPrice}`,
        })
      );
    }
  } catch (error) {
    await client.publish(
      "buyOrder",
      JSON.stringify({
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    );
  }
};
