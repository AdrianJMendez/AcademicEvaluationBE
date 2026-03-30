import express from "express";
import * as authController from '../../controllers/users/authControllers';

import { verifyTokenTest } from "../../utils/jwtService";

const router = express.Router();

router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);
router.post('/token/test', verifyTokenTest);
// router.post('/email/resend',authController.resendVerification);
// router.post('/email/test',authController.verifyEmailTest);
// router.post('/email/verify',authController.verifyEmailCode);

export default router;