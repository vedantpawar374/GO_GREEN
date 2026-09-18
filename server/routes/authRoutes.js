import express from "express";
import {loginUser,getCurrentUser} from "../controllers/userController.js";
import { authenticateUser } from "../middleware/authmiddleware.js";

const router=express.Router();
router.post("/login",loginUser);
router.get(
    "/me",
    authenticateUser,
    getCurrentUser
)
export default router;