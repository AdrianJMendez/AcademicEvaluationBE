import { Request, Response } from 'express';
import UserService from '../../services/users/userService';
import { formatRequest } from '../../utils/requestParams';
import JsonResponse from '../../utils/jsonResponse';

export const getUserById = async (req: Request, res: Response) => {
    try {
        const params = formatRequest(req);
        const id = parseInt(params.id);

        const result = await UserService.getUserById(id);
        res.status(result.getStatus()).json(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const params = formatRequest(req);
        let page = parseInt(params.page);
        let size = parseInt(params.size);
        let sort = parseInt(params.sort);

        const result = await UserService.getAll(page,size,sort);
        res.status(result.getStatus()).json(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
    }
}

// export const searchUsers = async (req: Request, res: Response) => {
//     try {
//         const params = formatRequest(req);

//         const result = await UserService.searchUsers(params.searchParam);
//         res.status(result.getStatus()).json(result);
//     }
//     catch (error) {
//         console.log(error);
//         res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
//     }
// }

// export const updateEnabledStatus = async (req: Request, res: Response)  => {
//     try {
//         const params = formatRequest(req);
//         const idUser = parseInt(params.idUser);
//         const enabled = params.isEnabled;

//         const result = await UserService.updateEnabledStatus(idUser, enabled);

//         res.status(result.getStatus()).json(result);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
//     }
// }

// export const updateUser = async (req: Request, res: Response)  => {
//     try {
//         const params = formatRequest(req);
//         const idUser = parseInt(params.id);

//         const result = await UserService.updateUser(idUser, params);
        
//         res.status(result.getStatus()).json(result.data);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
//     }
// }
