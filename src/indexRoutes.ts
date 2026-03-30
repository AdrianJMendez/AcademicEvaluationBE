import  express from 'express';
import './models/associations';
import usersRoutes from './routes/users/usersRoutes';
import authRoutes from './routes/users/authRoutes';
import publicRoutes from './routes/publicRoutes';

import { verifyToken } from './utils/jwtService';

const index = express.Router();

index.use('/auth', authRoutes);

index.use('/public', publicRoutes);

index.use(verifyToken);

index.use('/users', usersRoutes);

export default index;