import express from "express";

import {
    authenticateUser
} from "../middleware/authmiddleware.js";

import {
    getMyWalletTransactions
} from "../controllers/walletController.js";

const router = express.Router();

router.get(
    "/transactions",
    authenticateUser,
    getMyWalletTransactions
);

export default router;