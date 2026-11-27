import express from "express";

import {
    registerUser,
    getCurrentUser,
    getLeaderboard,
    getAdminAnalytics,
    getAdminUsersWithActivities,
} from "../controllers/userController.js";

import {
    authenticateUser
} from "../middleware/authmiddleware.js";

const router = express.Router();

router.post(
    "/register",
    registerUser
);

router.get(
    "/me",
    authenticateUser,
    getCurrentUser
);

router.get(
    "/leaderboard",
    authenticateUser,
    getLeaderboard
);

router.get(
    "/admin-analytics",
    authenticateUser,
    getAdminAnalytics
);

router.get(
    "/admin-users",
    authenticateUser,
    getAdminUsersWithActivities
);

export default router;