import { Request, Response } from 'express';
import { formatRequest } from '../utils/requestParams';
import JsonResponse from '../utils/jsonResponse';
import PublicService from '../services/publicService';

export const getRolesForRegistration = async (req: Request, res: Response) => {
    try {
        const result = await PublicService.getRolesForRegistration();
        
        res.status(result.getStatus()).json(result);
    } catch (err) {
        res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
    }
}

export const getCareersForRegistration = async (req: Request, res: Response) => {
    try {
        const result = await PublicService.getCareersForRegistration();
        
        res.status(result.getStatus()).json(result);
    } catch (err) {
        res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
    }
}