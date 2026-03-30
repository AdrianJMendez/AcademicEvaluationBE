import { Request, Response } from 'express';
import { formatRequest } from '../../utils/requestParams';
import JsonResponse from '../../utils/jsonResponse';
import CareerService from '../../services/academy/careerService';

export const getCareersByStudentId = async (req: Request, res: Response) => {
    try {
        const result = await CareerService.getCareersByStudentId();
        
        res.status(result.getStatus()).json(result);
    } catch (err) {
        res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
    }
}