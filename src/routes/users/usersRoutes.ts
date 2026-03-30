import express from "express";
import * as usersController from '../../controllers/users/usersControllers';

const router = express.Router();

router.get('/get/all/:page/:size/:sort', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);

export default router;
