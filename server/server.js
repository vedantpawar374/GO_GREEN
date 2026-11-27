
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js"
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import walletRoutes from "./routes/walletRoutes.js";

import {connectDatabase} from "./config/db.js";
import activityRoutes from "./routes/activityroutes.js";
import userRoutes from "./routes/userRoutes.js"

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, "../gogreen-client/dist");
const app=express();
const port=process.env.PORT || 5000;

const allowedOrigins = [
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
];
const clientUrl = process.env.CLIENT_URL?.trim().replace(/\/+$/, "");
if (clientUrl) {
    allowedOrigins.push(clientUrl);
}

app.use(
    cors({
        origin: allowedOrigins,
    })
);

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(
    "/uploads",
    express.static(path.resolve(__dirname, "uploads"))
);

app.get("/api/health", (request, response) => {
    response.json({
        success: true,
        message: "GOGreen API is running",
    });
});
app.use("/api/activities",activityRoutes);

app.use(
    "/api/users",
    userRoutes
)
app.use(
    "/api/wallet",
    walletRoutes
);

app.use((error, request, response, next) => {
    if (error instanceof SyntaxError && "body" in error) {
        return response.status(400).json({
            sucess: false,
            message: "Malformed JSON body. Remove extra quotes and send a JSON object.",
        });
    }
    next(error);
});

app.use("/api/auth",authRoutes);

if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    app.use((request, response, next) => {
        if (
            request.method === "GET" &&
            !request.path.startsWith("/api") &&
            !request.path.startsWith("/uploads")
        ) {
            return response.sendFile(path.join(clientDistPath, "index.html"));
        }
        next();
    });
}

async function startServer(){
    await connectDatabase();
    app.listen(port,()=>{
        console.log(
            `Server running at http://localhost:${port}`
        );
    });
}

startServer();