import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import taskRoutes from './modules/tasks/task.routes';

const app = express();

// Middleware สำหรับแปลงข้อมูลที่ส่งมาเป็น JSON และเปิดใช้งาน CORS
app.use(express.json());
app.use(cors());

// เชื่อมต่อ Auth Routes เข้ากับเส้นทาง API (เช่น /api/auth/register)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use(cors());

// Route ทดสอบเซิร์ฟเวอร์
app.get('/', (req, res) => {
  res.send('Stretchman Backend is running smoothly! 🚀');
});

export default app;