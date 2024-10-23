// routes/userRoutes.ts
import express from 'express';
import { RedisManager } from '../RedisManager';

const router = express.Router();


router.post('/mint', async (req, res) => {

    const { userId, stockSymbol, quantity, price } = req.body;
    try {
        const response: any = await RedisManager(
            { userId,stockSymbol,quantity, price, type: "minting" },
            "minting"
        );
        
        if (response.status === 200) {
            res.status(200).json({ message: response.message });
        } else if(response.status === 404) {
            res.status(404).json({ message: response.message });
        }  else if(response.status === 400) {
            res.status(400).json({ message: response.message });
        } else {
            res.status(500).json({ message: `error Found` });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Request failed" });
    }
});



export default router;