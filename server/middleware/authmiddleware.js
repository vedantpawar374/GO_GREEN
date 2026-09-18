import jwt from "jsonwebtoken";

export function authenticateUser(request,response,next){
    try{
        const authorizationHeader =
        request.headers.authorization;
        if(!authorizationHeader)
        {
            return response.status(401).json({
                sucess:false,
                message :"Authntication token is required",
            });
        }
        const parts=authorizationHeader.split(" ");
        if(
            parts.length !==2 ||
            parts[0] !== "Bearer"
        ){
            return response.status(401).json({
                sucess:false,
                message: "Invalid authencation format",
            });
        }
        const token=parts[1];
        const decodedToken=jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        request.user={
            userId:decodedToken.userId,
            role:decodedToken.role,
        };
        next();
    }catch(error)
    {
        console.error("Authntication error",error);
        return response.status(401).json({
            sucess:false,
            message:"Invalid or expired authentication token"
        });
    }
}