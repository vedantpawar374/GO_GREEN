import Activity from "../models/Activity.js";
import { calculateCarbonResult } from "../server/services/CarbonEngine.js";
import mongoose from "mongoose";
import { addPoints } from "../server/services/WalletService.js";
import User from "../models/User.js";


export async function createActivity(request, response) {
    try {
        const {
            description,
            distance,
            usedTransport,
            alternativeTransport,
        } = request.body;

        const userId = request.user.userId;
        if (!description || !distance || !usedTransport || !alternativeTransport) {
            return response.status(400).json({
                success: false,
                message: "All activity fields are required",
            });
        }

        if (!request.file) {
            return response.status(400).json({
                success: false,
                message: "Proof image is required",
            });
        }

        const normalizedDescription = String(description).trim();
        const normalizedUsedTransport = String(usedTransport).trim().toLowerCase();
        const normalizedAlternativeTransport = String(alternativeTransport).trim().toLowerCase();
        const numericDistance = Number(distance);

        if (!normalizedDescription || !Number.isFinite(numericDistance) || numericDistance <= 0) {
            return response.status(400).json({
                success: false,
                message: "Distance must be a positive number",
            });
        }

        if (normalizedUsedTransport === normalizedAlternativeTransport) {
            return response.status(400).json({
                success: false,
                message: "Used transport and avoided transport must be different",
            });
        }

        if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
            return response.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        const activityPayload = {
            userId: userId || null,
            description: normalizedDescription,
            distance: numericDistance,
            usedTransport: normalizedUsedTransport,
            alternativeTransport: normalizedAlternativeTransport,
            proofImage: request.file.filename,
            status: "pending",
            carbonSaved: null,
            pointsEarned: 0,
        };

        const activity = await Activity.create(activityPayload);

        return response.status(201).json({
            success: true,
            message: "Activity submitted for administrator verification",
            activity,
        });
    } catch (error) {
        console.error(error);

        if (error?.name === "ValidationError") {
            const firstValidationMessage = Object.values(error.errors || {})[0]?.message;
            return response.status(400).json({
                success: false,
                message: firstValidationMessage || "Activity data is invalid",
                error: error.message,
            });
        }

        return response.status(500).json({
            success: false,
            message: "Unable to submit activity",
            error: error.message,
        });
    }
}

export async function getPendingAcitivities(request, response) {
    try {
        const activities = await Activity.find({
            status: "pending",
        }).sort({
            createdAt: -1,
        });

        return response.status(200).json({
            success: true,
            count: activities.length,
            activities,
        });
    } catch (error) {
        console.error("Get pending activities error", error);
        return response.status(500).json({
            success: false,
            message: "Unable to retrieve pending activities",
            error: error.message,
        });
    }
}
//when the admin click on the a single activity he should aprove the activity of the user this is ment for that
export async function approveActivity(request,response){
    try{
        const {activityId}=request.params;
        const activity=await Activity.findById(activityId);
        if(!activity)
        {
            return response.status(400).json({
                sucess:false,
                message:"Activity not found",
            });
        }
    
    if(activity.status!=="pending"){
        return response.status(400).json({
            status:false,
            message:`Activity is already ${activity.status}`,
        });
    }


    //now since everything is valid i can calculate the carbon saved and points earned from the calculateCarbonResult in server/services/CarbonEngine.js
    const calculatedEmission=calculateCarbonResult({

        distance:activity.distance,
        usedTransport:activity.usedTransport,
        alternativeTransport:activity.alternativeTransport


    });
    activity.status = "approved";
    activity.carbonSaved = calculatedEmission.carbonSaved;
    activity.pointsEarned = calculatedEmission.pointsEarned;
    activity.rejectionReason = null;
    activity.approvedAt = new Date();

    await activity.save();
    await addPoints({
    userId: activity.userId,
    points: activity.pointsEarned,
    activityId: activity._id,
    transactionType: "Activity_REWARD",
    description: "Points earned for approved activity",
});

const user = await User.findById(activity.userId);

if (!user) {
    throw new Error("User not found");
}

user.totalCarbonSaved += activity.carbonSaved;

await user.save();
    return response.status(200).json({
        success: true,
        message: "Activity approved successfully",
        activity,
    });

    }
    catch(err)
    {
        console.error("Approve activity error:", err);
        return response.status(500).json({
        sucess:false,
        message:err.message || "unable to approve the activity"
    });
    }

}

//if i wanted to use the function in some other functin i have exporr it from here and import it into some other function

export async function rejectActivity(request, response) {
    try {
        const { activityId } = request.params;
        const { rejectReason } = request.body;

        if (!rejectReason?.trim()) {
            return response.status(400).json({
                success: false,
                message: "Rejection reason is required",
            });
        }

        const activity = await Activity.findById(activityId);

        if (!activity) {
            return response.status(400).json({
                success: false,
                message: "Activity not found",
            });
        }

        if (activity.status !== "pending") {
            return response.status(400).json({
                success: false,
                message: `Activity is already ${activity.status}`,
            });
        }

        activity.status = "rejected";
        activity.rejectionReason = rejectReason.trim();
        activity.carbonSaved = null;
        activity.pointsEarned = 0;

        await activity.save();
        await WalletTransaction.create({
            userId: activity.userId,
            activityId: activity._id,
            points: 0,
            transactionType: "ADMIN_ADJUSTMENT",
            description: `Activity rejected: ${activity.rejectionReason}`,
        });

        return response.status(200).json({
            success: true,
            message: "Activity rejected successfully",
            activity,
        });
    } catch (error) {
        console.error("Rejected activity error", error);
        return response.status(500).json({
            success: false,
            message: "Unable to reject activity",
            error: error.message,
        });
    }
}
export async function getMyActivities(request, response) {
    try {

        const userId = request.user.userId;

        const activities = await Activity.find({
            userId: userId,
        }).sort({
            createdAt: -1,
        });

        return response.status(200).json({
            success: true,
            count: activities.length,
            activities,
        });

    } catch (error) {

        console.error(
            "Get my activities error:",
            error
        );

        return response.status(500).json({
            success: false,
            message: "Unable to retrieve your activities",
            error: error.message,
        });
    }
}
