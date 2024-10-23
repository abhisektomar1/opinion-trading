// types.ts
export type StockType = 'yes' | 'no';

export interface StockBalance {
  quantity: number;
  locked: number;
}

export interface UserStockBalance {
  yes: StockBalance;
  no: StockBalance;
}

export interface UserStocks {
  [stockSymbol: string]: UserStockBalance;
}

export interface StockBalances {
  [userId: string]: UserStocks;
}

export interface INRBalance {
  balance: number;
  locked: number;
}

export interface INRBalances {
  [userId: string]: INRBalance;
}

export interface OrderEntry {
  total: number;
  orders: {
    [userId: string]: number;
  };
}

export interface PriceLevel {
  [price: number]: OrderEntry;
}

export interface StockOrders {
  yes: PriceLevel;
  no: PriceLevel;
}

export interface OrderBook {
  [stockSymbol: string]: StockOrders;
}

// Request/Response types
export interface OrderRequest {
  userId: string;
  stockSymbol: string;
  quantity: number;
  price: number;
  stockType: StockType;
}

export interface OrderResponse {
  status: number;
  message: string;
  matchedOrders?: MatchedOrder[];
  bestMatchedPrice?: number;
}

export interface MatchedOrder {
  sellerId: string;
  quantity: number;
  price: number;
}
