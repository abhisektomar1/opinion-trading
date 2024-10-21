import express, { type Request, type Response } from "express";
import { createClient } from "redis";
import userRoutes from "./routes/userRoutes"
import orderRoutes from "./routes/orderRoutes"
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json())
const port = 3000;

//redis
export const client = createClient();
client.on('error', (err) => console.log('Redis Client Error', err));

async function startServer() {
    try {
        await client.connect();
        console.log("Connected to Redis");

        app.listen(port, () => {
            console.log("Server is running on port 3000");
        });
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startServer();

app.use('/user', userRoutes);
app.use('/order', orderRoutes);

app.post('/symbol/create/:stockSymbol', async (req, res) => {
    const { stockSymbol } = req.params;
    const data = JSON.stringify({stockSymbol,type:"createStockSymbol"})
    await client.lPush("engine", data)
    return
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with Bun and TypeScript!");
});


