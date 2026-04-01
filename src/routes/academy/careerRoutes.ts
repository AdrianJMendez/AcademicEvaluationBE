import express from "express";
import * as careerController from '../../controllers/academy/careerController';

import { verifyTokenTest } from "../../utils/jwtService";

const path : string = '/career';
const router = express.Router();

router.get(`${path}/get`, careerController.getCareersByStudentId);
router.get(`${path}/:id/plan`, careerController.getCareerPlanById);

export default router;