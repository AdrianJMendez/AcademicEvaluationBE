import { Request, Response } from 'express';
import { formatRequest } from '../../utils/requestParams';
import JsonResponse from '../../utils/jsonResponse';
import CareerService from '../../services/academy/careerService';
import { getUserFromJWT } from '../../utils/jwtService';

export const getCareersByStudentId = async (req: Request, res: Response) => {
    try {
        const result = await CareerService.getCareersByStudentId();
        
        res.status(result.getStatus()).json(result);
    } catch (err) {
        res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
    }
}

export const getCareersForStudent = async (req: Request, res: Response) => {
    try {

        const user = await getUserFromJWT(req);

        const result = await CareerService.getCareersForStudent(user);
        
        res.status(result.getStatus()).json(result);
    } catch (err) {
        res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
    }
}

export const getSubjectsByCareer = async (req: Request, res: Response) => {
    try {

        const params = formatRequest(req);

        const idCareer = parseInt(params.idCareer);

        const result = await CareerService.getSubjectsByCareer(idCareer);
        
        res.status(result.getStatus()).json(result);
    } catch (err) {
        res.status(500).json(JsonResponse.error(500,"Error Interno del Servidor."));
    }
}

export const getCareerPlanById = async (req: Request, res: Response) => {
    try {

        const params = formatRequest(req);

        const idCareer = Number(params.id);

        if (Number.isNaN(idCareer) || idCareer <= 0) {
            return res.status(400).json(JsonResponse.error(400, 'El id de carrera no es válido.'));
        }

        const result = await CareerService.getCareerPlanById(idCareer);
        res.status(result.getStatus()).json(result);
    } catch (err) {
        res.status(500).json(JsonResponse.error(500, "Error Interno del Servidor."));
    }
}