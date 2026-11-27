 
import mongoose from "mongoose";

const activitySchema=new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
            required: false,
            default: null,
        },
        description:{
            type:String,
            required:[true,"Activity description is required"],
            trim:true,
            minlength:5,
            maxlength:500,
        },
        distance:{
            type:Number,
            required:[true,"Distance is required"],
            min:[0.1,"Distance must be greater than zero"],
        },
        usedTransport:{
            type:String,
            required:true,
            enum:[
                "walking",
                "bicycle",
                "train",
                "bus",
                "bike",
                "car",
            ],
        },
        alternativeTransport:{
            type:String,
            required: true,
            enum:[
                "walking",
                "bicycle",
                "train",
                "bus",
                "bike",
                "car",
            ],
        },
        location: {
            type: String,
            trim: true,
            maxlength: 200,
            default: "",
        },
        proofImage:{
            type:String,
            required:[true,"proof image is required"],
        },
        status:{
            type:String,
            enum:["pending","approved","rejected"],
            default:"pending",
        },
        approvedAt:{
        type:Date,
        default:null
    }   ,
        carbonSaved:{
            type:Number,
            default:null,
        },
        pointsEarned:{
            type:Number,
            default:0,
        },
        rejectionReason:{
            type:String,
            trim:true,
            default:null,
        },
    },
    {
        timestamps:true,
    }
);

const Activity=mongoose.model(
    "Activity",
    activitySchema
);

export default Activity;