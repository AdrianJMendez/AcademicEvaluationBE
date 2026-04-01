import express from "express";

const router = express.Router();

import * as publicController from '../controllers/publicController';

router.get("/get/roles", publicController.getRolesForRegistration);
router.get("/get/careers", publicController.getCareersForRegistration);

export default router;