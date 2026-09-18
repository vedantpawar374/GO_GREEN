import bcrypt from "bcryptjs";
 import jwt from "jsonwebtoken";

import User from "../models/User.js";

// add the controller for registration
export async function registerUser(request,response)
{
    try{
        const {name,email,password,role}=request.body ?? {};
    
            if (!name || !email || !password) {
        return response.status(400).json({
            sucess:false,
            message:"Name email and password are required",
        })
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const existingUser=await User.findOne({
            email:email.toLowerCase(),
        });
        if(existingUser){
            return response.status(400).json({
                sucess:false,
                message:"User already exist",
            });
        }

        const user=await User.create({
            name,
            email:email.toLowerCase(),
            password:hashedPassword,
            role,
        })
        return response.status(201).json({
            sucess:true,
            message:"User registered sucessfully",
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        })
    }
    catch(err)
    {
        console.log("registration error",err);
        return response.status(500).json({
            sucess:false,
            message:"Unable to register user",
        });
    }
}

export  async function loginUser(request,response)
{
    try{
        const {email,password}=request.body;
        const user=await User.findOne({email:email.toLowerCase()})
        if(!user)
        {
            return response.status(401).json({
                sucess:false,
                message:"User not present"
            })
        }
        const passwordMatch= await bcrypt.compare(
            password,user.password
        )
        if(!passwordMatch)
        {
            return response.status(401).json({
                sucess:false,
                message:"Password does not match"
            });
        }
        const token=jwt.sign(
            {
                userId:user._id,
                role:user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d",
            }
        );
        return response.status(200).json({
            sucess:true,
            message:"login sucessfull",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
            },
        });
    }catch(error)
    {
        console.error("Login errro",error);
        return response.status(500).json({
            sucess:false,
            message:"Unable to login",
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