// import { Request, Response, NextFunction } from "express";
// import JsonResponse from './jsonResponse';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import User from "../models/users/userModel";
// import Action from "../models/assets/actionModel";
// import ActionRole from "../models/users/actionRoleModel";

// export const checkUserAction = async (req: Request, res: Response, next: NextFunction) =>{

//     const header = req.header("Authorization") || "";
//     const token = header.split(" ")[1];
//     if (!token) {
//         return res.status(401).json(JsonResponse.error(401,"Autorización no proveida."));
//     }

//     const decodedToken = jwt.decode(token,{json:true});
//     const actionName = req.route.stack.at(-1).name;

//     console.log("email: ",decodedToken?.email, "actionName: ",actionName);

//     const user = await User.findOne({
//         where: {
//             email : decodedToken?.email
//         }
//     });

//     const action = await Action.findOne({
//         where : {
//             actionName : actionName
//         }
//     });

//     const data = await ActionRole.findOne({
//         where :{
//             idRole : user?.idRole,
//             idAction : action?.idAction
//         }
//     });

//     if(!data){
//         return res.status(405).json(JsonResponse.error(403,"Acceso no autorizado."));
//     }else{
//         next();
//     }
// }