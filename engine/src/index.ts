import { cancel } from "./services/cancel";
import express, { type Request, type Response } from "express";
import { createClient } from "redis";
import bodyParser from "body-parser";
import { createUsers } from "./services/CreateUser";
import { createStockSymbol } from "./services/createStockSymbol";
import { onRamp } from "./services/onRamp";
import { sellOrder } from "./services/sellOrder";
import { buyOrder } from "./services/buyOrder";
import { minting } from "./services/minting";
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "./dataStore";

const app = express();
app.use(bodyParser.json());
const port = 3001;

//redis
export const client = createClient();
client.on("error", (err) => console.log("Redis Client Error", err));

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to Redis");

    app.listen(port, () => {
      console.log("Server is running on port 3001");
    });
    // Main loop
    while (true) {
      try {
        const data = await client.brPop("engine", 0);
        //@ts-ignore
        const parseData = JSON.parse(data?.element);
        const type = parseData?.type;

        switch (type) {
          case "createUser":
            await createUsers(parseData);
            break;
          case "createStockSymbol":
            await createStockSymbol(parseData);
            break;
          case "onRamp":
            await onRamp(parseData);
            break;
          case "sellOrder":
            await sellOrder(parseData);
            break;
          case "buyOrder":
            await buyOrder(parseData);
            break;
          case "minting":
            await minting(parseData);
            break;
          case "cancel":
            await cancel(parseData);
            break;

          default:
            break;
        }
        console.log(data, "recieved data");
      } catch (error) {
        console.error("Error processing submission:", error);
      }
    }
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}

startServer();

app.get("/", (req: Request, res: Response) => {
  res.send({ message: ORDERBOOK, STOCK_BALANCES, INR_BALANCES });
});
