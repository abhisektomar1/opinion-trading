// dataStore.ts

import type { INRBalances, OrderBook, StockBalances } from "./type";

export const STOCK_BALANCES: StockBalances = {};
export const INR_BALANCES: INRBalances = {};
export const ORDERBOOK: OrderBook = {};



// export function createSymbol(stockSymbol) {
//     if (!ORDERBOOK[stockSymbol]) {
//         ORDERBOOK[stockSymbol] = { yes: {}, no: {} };
//     }
// }

// export function createStockBalance(userId, stockSymbol) {
//     if (!STOCK_BALANCES[userId]) {
//       STOCK_BALANCES[userId] = {};
//     }
  
//     if (!STOCK_BALANCES[userId][stockSymbol]) {
//       STOCK_BALANCES[userId][stockSymbol] = {
//         yes: { quantity: 0, locked: 0 }, 
//         no: { quantity: 0, locked: 0 }, 
//       };
//     }
// }

