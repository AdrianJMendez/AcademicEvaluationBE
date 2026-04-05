import express from "express";
import * as requestController from '../../controllers/request/requestController';

const router = express.Router();

router.get(`/student/get/status/:idStatus/career/:idCareer/:page/:size/:sort`, requestController.getRequestByStatusAndCareerForStudent);
router.get(`/student/get/count`, requestController.getRequestCountForStudent);
router.get(`/student/get/detail/:idRequest`, requestController.getRequestDetailForStudent);
router.get(`/employee/get/count`, requestController.getRequestCountForEmployee);
router.get(`/employee/get/status/:statusName`, requestController.getRequestsForEmployeeByStatus);
router.get(`/employee/get/detail/:idRequest`, requestController.getRequestDetailForEmployee);
router.get(`/employee/get/images/:idRequest`, requestController.getRequestImagesForEmployee);
router.get(`/employee/report/:idRequest/download`, requestController.downloadReportForEmployee);
router.post(`/employee/report/:idRequest`, requestController.generateReportForEmployee);
router.patch(`/employee/take/:idRequest`, requestController.takeRequestForEmployee);
router.patch(`/employee/review/:idRequest`, requestController.finishReviewForEmployee);
router.post(`/`, requestController.createRequest);

export default router;
