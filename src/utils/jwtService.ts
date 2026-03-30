import jwt from 'jsonwebtoken';
import { SECRET_KEY, TIME_OUT } from '../config';
import { Request, Response, NextFunction } from "express";
import JsonResponse from './jsonResponse';
import User from '../models/users/userModel';

export const generateToken = (payload:any) =>{

    const token = jwt.sign({
            idUser: payload.idUser ,
            email: payload.email,
            idRole: payload.idRole
        }, SECRET_KEY , {
            expiresIn: TIME_OUT
        });
            
    return token;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) =>{
    const header = req.header("Authorization") || "";
    const token = header.split(" ")[1];
    if (!token) {
        return res.status(401).json(JsonResponse.error(401,"Autorización no proveida."));
    }
    try {
        const payload = jwt.verify(token, SECRET_KEY);

        const decodedToken = jwt.decode(token,{json:true});

        refreshToken(decodedToken,res,next);

        //next();
        
    } catch (error) {
        console.log(error);
        return res.status(403).json(JsonResponse.error(403,"Autorización inválida."));
    }
}

const refreshToken = (decodedToken: any, res: Response, next: NextFunction) => {

    const newToken = generateToken(decodedToken);

    res.setHeader("Authorization", `Bearer ${newToken}`);
    
    next();
}

export const verifyTokenTest = (req: Request, res: Response, next: NextFunction) =>{
    const header = req.header("Authorization") || "";
    const token = header.split(" ")[1];

    if (!token) {
        return res.status(401).json(JsonResponse.error(401,"Autorización no proveida."));
    }
    try {
        const payload = jwt.verify(token, SECRET_KEY);

        

        return res.status(200).json(JsonResponse.success(payload,"Acceso verificado con éxito."));
        //next();
    } catch (error) {
        return res.status(403).json(JsonResponse.error(403,"Autorización inválida."));
    }
}

export const getUserFromJWT = async (req: Request): Promise<User> =>{
    const header = req.header("Authorization") || "";
    const token = header.split(" ")[1];

    const decodedToken = jwt.decode(token,{json:true});

    const data = await User.findOne({
        where:{
            email: decodedToken?.email
        }
    });

    if(!data){
        throw new Error("El usuario no existe.");
    }

    return data;
}