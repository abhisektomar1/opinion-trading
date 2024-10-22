// routes/userRoutes.ts
import express from 'express';
import { RedisManager } from '../RedisManager';

const router = express.Router();


router.post('/create/:userId', async (req, res) => {
    try {
        const response: any = await RedisManager(
            { userId: req.params.userId, type: "createUser" },
            "createUser"
        );
        
        if (response.status === 200) {
            res.status(201).json({ message: `User ${req.params.userId} created` });
        } else {
            res.status(400).json({ message: `User already exists` });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : "Request failed" });
    }
});



export default router;