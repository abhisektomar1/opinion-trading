import express, { type Request, type Response } from "express";
import { createClient } from "redis";
import bodyParser from "body-parser";
import { createUsers } from "./services/CreateUser";
import { createStockSymbol } from "./services/createStockSymbol";
import { onRamp } from "./services/onRamp";

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

          default:
            break;
        }
        console.log(data, "recieved data");
      } catch (error) {
        console.error("Error processing submission:", error);
        // Implement your error handling logic here. For example, you might want to push
        // the submission back onto the queue or log the error to a file.
      }
    }
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}

startServer();


app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with Bun and TypeScript!");
});
