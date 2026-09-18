import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
    authenticateUser
} from "../middleware/authmiddleware.js"

import{
    createActivity,
    getPendingAcitivities,
    getMyActivities,
    approveActivity,
    rejectActivity,
} from "../controllers/activityController.js";

const router=express.Router();

router.post(
    "/",
    authenticateUser,
    upload.single("proofImage"),
    createActivity
);  
router.get(
    "/pending",
    getPendingAcitivities
);
router.get(
    "/my",
    authenticateUser,
    getMyActivities
);
router.patch(
    "/:activityId/approve",
    approveActivity
);
router.patch(
    "/:activityId/reject",
    rejectActivity
);

export default router;