import  express from 'express';
import './models/associations';
import usersRoutes from './routes/users/usersRoutes';
import authRoutes from './routes/users/authRoutes';
import publicRoutes from './routes/publicRoutes';
import careerRoutes from './routes/academy/careerRoutes';
import requestRoutes from './routes/request/requestRoutes';

import { verifyToken } from './utils/jwtService';

const index = express.Router();

index.use('/auth', authRoutes);

index.use('/public', publicRoutes);

index.use(verifyToken);

index.use('/users', usersRoutes);

index.use('/academy',careerRoutes);

index.use('/request', requestRoutes);

export default index;