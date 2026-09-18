import mongoose from "mongoose"
 
const walletTransactionSchema =new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User",
            required:true,
        },
        activityId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Activity",
            default:null,
        },
        points:{
            type:Number,
            required:true,
        },
        transactionType:{
            type:String,
            enum:[
                "Activity_REWARD",
                "REWARD_REDEMPTION",
                "BONUS",
                "ADMIN_ADJUSTMENT",
            ],
            required:true,
        },
        description:{
            type:String,
            default: "",
        },
    },
    {
        timestamps:true,
    }
);

const WalletTransaction=mongoose.model(
    "WalletTransaction",
    walletTransactionSchema
);
export default WalletTransaction;