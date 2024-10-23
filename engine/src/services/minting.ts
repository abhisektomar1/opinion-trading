import { createUsers } from './CreateUser';
import { client } from "..";
import { createStockBalance, INR_BALANCES, STOCK_BALANCES } from '../dataStore';

export const minting =  async (data:any) => {
    console.log(data,"minting");
    const { userId, stockSymbol, quantity, price } = data;
    try {
  
    if (!INR_BALANCES[userId]) {
        return await client.publish("minting",JSON.stringify({ status: 404, message: `User ${userId} not found` }))
    }
    const totalCost = quantity * price; 
    const userBalance = INR_BALANCES[userId].balance;
  
    if (userBalance < totalCost) {
        return await client.publish("minting",JSON.stringify({ status: 400, message: `Insufficient balance. You need ${totalCost} but only have ${userBalance}` }))
    }
    
    INR_BALANCES[userId].balance -= totalCost;
  
    createStockBalance(userId, stockSymbol);
  
    STOCK_BALANCES[userId][stockSymbol].yes.quantity += quantity;
    STOCK_BALANCES[userId][stockSymbol].no.quantity += quantity;
  
     await client.publish("minting",JSON.stringify({ status: 200, message: `Minted ${quantity} 'yes' and 'no' tokens for user ${userId}, remaining balance is ${INR_BALANCES[userId].balance}` }))

 
  
    } catch (error) {
        await client.publish("minting", JSON.stringify({ 
            status: 500, 
            error: error instanceof Error ? error.message : "Unknown error" 
        }));
    }
}
