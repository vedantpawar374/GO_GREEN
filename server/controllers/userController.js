import bcrypt from "bcryptjs";
 import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Activity from "../models/Activity.js";

export async function registerUser(request, response) {
    try {
        const body = request.body ?? {};
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const email =
            typeof body.email === "string"
                ? body.email.trim().toLowerCase()
                : "";
        const { password } = body;

        if (
            !name ||
            !email ||
            typeof password !== "string" ||
            !password.trim()
        ) {
            return response.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return response.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        if (password.length < 6) {
            return response.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return response.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user",
        });

        return response.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Registration error", error);
        return response.status(500).json({
            success: false,
            message: "Unable to register user",
        });
    }
}

export async function loginUser(request, response) {
    try {
        const body = request.body ?? {};
        const email =
            typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const { password } = body;

        if (
            !email ||
            typeof password !== "string" ||
            !password.trim()
        ) {
            return response.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return response.status(401).json({
                success: false,
                message: "No account is registered with this email",
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return response.status(401).json({
                success: false,
                message: "Incorrect password",
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            },
        );

        return response.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                walletPoints: user.walletPoints,
                totalCarbonSaved: user.totalCarbonSaved,
            },
        });
    } catch (error) {
        console.error("Login error", error);
        return response.status(500).json({
            success: false,
            message: "Unable to login",
        });
    }
}
export async function getCurrentUser(request, response) {
    try {

        const userId = request.user.userId;

        const user = await User.findById(userId).select(
            "-password"
        );

        if (!user) {
            return response.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return response.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                walletPoints: user.walletPoints,
                totalCarbonSaved: user.totalCarbonSaved,
            },
        });

    } catch (error) {

        console.error(
            "Get current user error:",
            error
        );

        return response.status(500).json({
            success: false,
            message: "Unable to retrieve user information",
        });
    }
}

export async function getLeaderboard(request, response) {
    try {
        const topUsers = await User.find({})
            .sort({ totalCarbonSaved: -1 })
            .limit(20)
            .select("name totalCarbonSaved walletPoints role");

        return response.status(200).json({
            success: true,
            leaderboard: topUsers
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to retrieve leaderboard",
        });
    }
}

export async function getAdminAnalytics(request, response) {
    try {
        if (request.user.role !== "admin") {
            return response.status(403).json({
                success: false,
                message: "Admin access is required",
            });
        }

        const [totalUsers, pendingActivities, totals] = await Promise.all([
            User.countDocuments({ role: "user" }),
            Activity.countDocuments({ status: "pending" }),
            User.aggregate([
                { $match: { role: "user" } },
                {
                    $group: {
                        _id: null,
                        totalCarbonSaved: { $sum: "$totalCarbonSaved" },
                        totalWalletPoints: { $sum: "$walletPoints" },
                    },
                },
            ]),
        ]);

        return response.status(200).json({
            success: true,
            analytics: {
                totalUsers,
                pendingActivities,
                totalCarbonSaved: totals[0]?.totalCarbonSaved || 0,
                totalWalletPoints: totals[0]?.totalWalletPoints || 0,
            },
        });
    } catch (error) {
        console.error("Admin analytics error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to retrieve admin analytics",
        });
    }
}

export async function getAdminUsersWithActivities(request, response) {
    if (request.user?.role !== "admin") {
        return response.status(403).json({
            success: false,
            message: "Admin access is required",
        });
    }

    try {
        const [users, activities] = await Promise.all([
            User.find({ role: "user" })
                .select("-password")
                .sort({ createdAt: -1 })
                .lean(),
            Activity.find({})
                .sort({ createdAt: -1 })
                .lean(),
        ]);
        const activitiesByUser = new Map();

        for (const activity of activities) {
            const userId = String(activity.userId);
            const userActivities = activitiesByUser.get(userId) || [];
            userActivities.push({
                _id: activity._id,
                description: activity.description,
                distance: activity.distance,
                usedTransport: activity.usedTransport,
                alternativeTransport: activity.alternativeTransport,
                location: activity.location ?? "",
                proofImage: activity.proofImage,
                status: activity.status,
                carbonSaved: activity.carbonSaved,
                pointsEarned: activity.pointsEarned,
                rejectionReason: activity.rejectionReason,
                createdAt: activity.createdAt,
            });
            activitiesByUser.set(userId, userActivities);
        }

        const enrichedUsers = users.map((user) => {
            const userActivities =
                activitiesByUser.get(String(user._id)) || [];
            const approvedCount = userActivities.filter(
                (activity) => activity.status === "approved",
            ).length;
            const pendingCount = userActivities.filter(
                (activity) => activity.status === "pending",
            ).length;
            const rejectedCount = userActivities.filter(
                (activity) => activity.status === "rejected",
            ).length;

            return {
                ...user,
                activities: userActivities,
                activityCount: userActivities.length,
                approvedCount,
                pendingCount,
                rejectedCount,
            };
        });

        return response.status(200).json({
            success: true,
            users: enrichedUsers,
        });
    } catch (error) {
        console.error("Admin users error:", error);
        return response.status(500).json({
            success: false,
            message: "Unable to retrieve admin user activity",
        });
    }
}