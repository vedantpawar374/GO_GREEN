import User from "../../models/User.js";
import WalletTransaction from "../../models/WalletTransaction.js";

export async function addPoints({
    userId,
    points,
    activityId=null,
    transactionType,
    description= "",
}){
    if(points <=0)
    {
        throw new Error("Points must be greater than zero");
    }
    const user=await User.findById(userId);
    if(!user)
    {
        throw new Error("User not found");
    }
    user.walletPoints+=points;
    await user.save();

    const transaction=await WalletTransaction.create({
        userId,
        activityId,
        points,
        transactionType,
        description,
    });
    return {
        balance:user.walletPoints,
        transaction,
    };
}