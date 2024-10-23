import express, { type Request, type Response } from "express";
import { createClient } from "redis";
import userRoutes from "./routes/userRoutes"
import orderRoutes from "./routes/orderRoutes"
import bodyParser from 'body-parser';
import { RedisManager } from "./RedisManager";

const app = express();
app.use(bodyParser.json())
const port = 3000;

export const client = createClient({
    name: 'main-client'
});

export const pubSub = client.duplicate();

client.on('error', (err) => console.log('Redis Main Client Error', err));
pubSub.on('error', (err) => console.log('Redis PubSub Client Error', err));

let isConnected = false;

async function startServer() {
    try {
        await client.connect();
        await pubSub.connect();
        
        isConnected = true;
        console.log("Connected to Redis");

        app.listen(port, () => {
            console.log("Server is running on port 3000");
        });
    } catch (error) {
        console.error("Failed to connect to Redis", error);
        process.exit(1); 
    }
}

const checkRedisConnection = (req: Request, res: Response, next: Function) => {
    if (!isConnected) {
        return res.status(503).json({ message: "Service unavailable - Redis not connected" });
    }
    next();
};

//@ts-ignore
app.use(checkRedisConnection);

// Routes
app.use('/user', userRoutes);
app.use('/order', orderRoutes);

app.post('/symbol/create/:stockSymbol', async (req, res) => {
    const { stockSymbol } = req.params;
    try {
        const response: any = await RedisManager(
            { stockSymbol: stockSymbol, type: "createStockSymbol" },
            "createStockSymbol"
        );
        if (response.status === 200) {
            res.status(201).json({ message: `Symbol created` });
        } else {
            res.status(400).json({ message: `Symbol already exists` });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to queue symbol creation request" });
    }
});

 app.post('/onramp/inr',async (req, res) => {
      const { userId, amount } = req.body;
      try {
        const response: any = await RedisManager(
            { userId: userId, amount:amount, type: "onRamp" },
            "onRamp"
        );
        if (response.status === 200) {
            res.status(200).json({ message: `Onramped ${userId} with amount ${amount}` });
        } else {
            res.status(400).json({ message: `Please verify yourself first` });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to onRamp amount request" });
    }
     
  });


app.get("/", (req: Request, res: Response) => {
    res.send("Hello, Express with Bun and TypeScript!");
});

startServer();

process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await client.quit();
    await pubSub.quit();
    process.exit(0);
});