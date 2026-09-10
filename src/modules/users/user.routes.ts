import { Router } from 'express';
import { getProfile } from './user.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

// เส้นทางนี้ต้องผ่านด่าน verifyToken ก่อน ถึงจะเรียกใช้ getProfile ได้
router.get('/profile', verifyToken, getProfile);

export default router;