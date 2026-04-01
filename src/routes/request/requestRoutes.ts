import express from "express";
import * as requestController from '../../controllers/request/requestController';

// const path : string = '/career';
const router = express.Router();

router.get(`/student/get/status/:idStatus/career/:idCareer/:page/:size/:sort`, requestController.getRequestByStatusAndCareerForStudent);
router.get(`/student/get/count`, requestController.getRequestCountForStudent);

export default router;