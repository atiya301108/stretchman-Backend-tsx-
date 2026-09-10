import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // ดึง userId ที่ถูกถอดรหัสมาจาก Middleware เมื่อสักครู่
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true } // ไม่เอา password ออกมาแสดง
    });

    if (!user) {
      return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้งาน" });
    }

    res.status(200).json({
      message: "ดึงข้อมูลโปรไฟล์สำเร็จ!",
      profile: user
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์", error });
  }
};