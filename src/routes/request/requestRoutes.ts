import express from "express";
import * as requestController from '../../controllers/request/requestController';

const router = express.Router();

router.get(`/student/get/status/:idStatus/career/:idCareer/:page/:size/:sort`, requestController.getRequestByStatusAndCareerForStudent);
router.get(`/student/get/count`, requestController.getRequestCountForStudent);
router.get(`/employee/get/count`, requestController.getRequestCountForEmployee);
router.get(`/employee/get/status/:statusName`, requestController.getRequestsForEmployeeByStatus);
router.get(`/employee/get/detail/:idRequest`, requestController.getRequestDetailForEmployee);
router.patch(`/employee/take/:idRequest`, requestController.takeRequestForEmployee);
router.patch(`/employee/review/:idRequest`, requestController.finishReviewForEmployee);

export default router;