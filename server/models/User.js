import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    password :{
        type:String,
        required:true,

    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user",
    },
    walletPoints:{
        type:Number,
        default:0,
        min:0,
    },  
    totalCarbonSaved:{
        type:Number,
        default:0,
        min:0
        },  
},
{
    timestamps:true,
}
);

const user=mongoose.model("User",userSchema);
export default user;