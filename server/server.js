
import authRoutes from "./routes/authRoutes.js"
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import walletRoutes from "./routes/walletRoutes.js";

import {connectDatabase} from "./config/db.js";
import activityRoutes from "./routes/activityRoutes.js";
import userRoutes from "./routes/userroutes.js"

dotenv.config();

const app=express();
const port=process.env.PORT || 5000;

app.use(
    cors({
        origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
    })
);

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(
    "/uploads",
    express.static(path.resolve("uploads"))
);

app.get("/",(request,response)=>{
    response.json(({
        sucess:true,
        message:"GOGreen API is running",
    }));
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

async function startServer(){
    await connectDatabase();
    app.listen(port,()=>{
        console.log(
            `Server running at http://localhost:${port}`
        );
    });
}

startServer();