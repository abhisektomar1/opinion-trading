// websocket-server/src/index.ts
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createClient } from 'redis';

// 1. Basic Express and WebSocket setup
const app = express();
const httpServer = app.listen(3002);
const wss = new WebSocketServer({ server: httpServer });

// 2. Setup Redis subscriber
const subscriber = createClient();
await subscriber.connect();

// 3. Store active connections and their subscriptions
// Key is stockSymbol, value is array of WebSocket connections
const connections = new Map<string, WebSocket[]>();

// 4. Handle new WebSocket connections
wss.on('connection', async (ws) => {
  console.log('New client connected');

  // 5. Handle messages from client
  ws.on('message', (message) => {
    try {
        // console.log(message.toString(),"message");
        
      const data = JSON.parse(message.toString());
      console.log(data,"data");
      
      // Handle subscription request
      if (data.type === 'subscribe') {
        handleSubscribe(ws, data.stockSymbol);
      }
      
      // Handle unsubscribe request
      if (data.type === 'unsubscribe') {
        handleUnsubscribe(ws, data.stockSymbol);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // 6. Handle client disconnection
  ws.on('close', () => {
    handleDisconnect(ws);
  });
});

// 7. Helper function to handle subscriptions
function handleSubscribe(ws: WebSocket, stockSymbol: string) {
  // Get or create array of connections for this stock
  if (!connections.has(stockSymbol)) {
    connections.set(stockSymbol, []);
  }
  
  // Add this connection to the stock's subscribers
  const stockConnections = connections.get(stockSymbol)!;
  if (!stockConnections.includes(ws)) {
    stockConnections.push(ws);
  }
  
  // Send confirmation to client
  ws.send(JSON.stringify({
    type: 'subscribed',
    stockSymbol,
    message: `Subscribed to ${stockSymbol}`
  }));
}

// 8. Helper function to handle unsubscribe
function handleUnsubscribe(ws: WebSocket, stockSymbol: string) {
  const stockConnections = connections.get(stockSymbol);
  if (stockConnections) {
    const index = stockConnections.indexOf(ws);
    if (index !== -1) {
      stockConnections.splice(index, 1);
    }
    // Remove stock from map if no more subscribers
    if (stockConnections.length === 0) {
      connections.delete(stockSymbol);
    }
  }
}

// 9. Helper function to handle disconnection
function handleDisconnect(ws: WebSocket) {
  // Remove this connection from all subscriptions
  connections.forEach((subscribers, stockSymbol) => {
    const index = subscribers.indexOf(ws);
    if (index !== -1) {
      subscribers.splice(index, 1);
      if (subscribers.length === 0) {
        connections.delete(stockSymbol);
      }
    }
  });
}

// 10. Listen for orderbook updates from Redis
await subscriber.subscribe('orderbook', (message) => {
  try {
    const update = JSON.parse(message);
    const { stockSymbol, orderbook } = update;
    
    // Get all subscribers for this stock
    const subscribers = connections.get(stockSymbol);
    if (subscribers) {
      // Prepare the message once
      const updateMessage = JSON.stringify({
        type: 'orderbook',
        stockSymbol,
        data: orderbook
      });
      
      // Send to all connected clients
      subscribers.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(updateMessage);
        }
      });
    }
  } catch (error) {
    console.error('Error broadcasting orderbook update:', error);
  }
});