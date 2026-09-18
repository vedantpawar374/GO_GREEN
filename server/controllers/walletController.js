import WalletTransaction from "../models/WalletTransaction.js";

export async function getMyWalletTransactions(request, response) {

    try {

        const userId = request.user.userId;

        const transactions = await WalletTransaction.find({
            userId: userId,
        })
            .sort({
                createdAt: -1,
            })
            .populate(
                "activityId",
                "description carbonSaved pointsEarned"
            );

        return response.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });

    } catch (error) {

        console.error(
            "Get wallet transactions error:",
            error
        );

        return response.status(500).json({
            success: false,
            message: "Unable to retrieve wallet transactions",
            error: error.message,
        });
    }
}