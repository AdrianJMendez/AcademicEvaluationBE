import express from "express";
import * as careerController from '../../controllers/academy/careerController';

const path : string = '/career';
const router = express.Router();

router.get(`${path}/get`, careerController.getCareersByStudentId);  ///RUTA DE PRUEBA NO TIENE UTILIDAD
router.get(`${path}/student/get/`, careerController.getCareersForStudent);
router.get(`${path}/get/subjects/:idCareer`, careerController.getSubjectsByCareer);
router.get(`${path}/:id/plan`, careerController.getCareerPlanById);

export default router;