import { Request, Response } from 'express';
import RequestService from '../../services/request/requestService';
import { formatRequest } from '../../utils/requestParams';
import JsonResponse from '../../utils/jsonResponse';
import { getUserFromJWT } from '../../utils/jwtService';

export const getRequestByStatusAndCareerForStudent = async (req: Request, res: Response) => {
    try {
        const params = formatRequest(req);
        const idStatus = parseInt(params.idStatus);
        const idCareer = parseInt(params.idCareer);
        const page = parseInt(params.page);
        const size = parseInt(params.size);
        const sort = parseInt(params.sort);

        const user = await getUserFromJWT(req);

        const result = await RequestService.getRequestByStatusAndCareerForStudent(user,idStatus,idCareer,page,size,sort);
        res.status(result.getStatus()).json(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
    }
}

export const getRequestCountForStudent = async (req: Request, res: Response) => {
    try {

        const user = await getUserFromJWT(req);

        const result = await RequestService.getRequestCountForStudent(user);
        res.status(result.getStatus()).json(result);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
    }
}