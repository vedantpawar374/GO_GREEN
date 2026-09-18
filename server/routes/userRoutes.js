import express from "express";

import {
    registerUser,
    getCurrentUser
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

export default router;