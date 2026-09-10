import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from './task.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

// ทุกเส้นทางต้องผ่านด่าน verifyToken เพื่อความปลอดภัย
router.get('/', verifyToken, getTasks);
router.post('/', verifyToken, createTask);
router.put('/:id', verifyToken, updateTask);     // เพิ่มเส้นทางอัปเดต
router.delete('/:id', verifyToken, deleteTask);  // เพิ่มเส้นทางลบ

export default router;