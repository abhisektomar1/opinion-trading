import express from 'express';
import { RedisManager } from '../RedisManager';

const  router = express.Router();

router.post('/sell', async (req, res) => {
    const { userId, stockSymbol, quantity, price, stockType } = req.body;

    try {
        const response: any = await RedisManager(
            { userId,stockSymbol, quantity, price, stockType, type: "sellOrder" },
            "sellOrder"
        );
        
        if (response.status === 200) {
            res.status(200).json({ message: `Sell order placed and pending` });
        } else if(response.status === 404) {
            res.status(404).json({ message: `User ${userId} or stock ${stockSymbol} not found.` });
        }  else if(response.status === 400) {
            res.status(404).json({ message: `Invalid stock type. Must be 'yes' or 'no' or Insufficient stock balance ` });
        } else {
            res.status(500).json({ message: `error Found` });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Request failed" });
    }
});



export default router; 