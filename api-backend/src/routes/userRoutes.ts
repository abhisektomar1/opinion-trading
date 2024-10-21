import express from 'express';
import { client } from '../index';

const  router = express.Router();

router.post('/create/:userId',async (req, res) => {
    const { userId } = req.params;
    console.log(userId);
    const data = JSON.stringify({userId,type:"createUser"})
    await client.lPush("engine", data)
    return
    // res.json({message: "User creation pending"})
});


export default router; 