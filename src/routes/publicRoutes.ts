import express from "express";

const router = express.Router();

import * as publicController from '../controllers/publicController';

router.get("/get/roles", publicController.getRolesForRegistration);

export default router;