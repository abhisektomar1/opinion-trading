import express from 'express';

const  router = express.Router();

router.post('/create/:userId', (req, res) => {
    const { userId } = req.params;
    console.log(userId);
    
});



export default router; 