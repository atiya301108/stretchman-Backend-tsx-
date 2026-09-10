import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // 1. เช็กว่ามีอีเมลนี้ในระบบหรือยัง
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    // 2. เข้ารหัสผ่าน (Hashing) ก่อนบันทึกลงฐานข้อมูล
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. สร้าง User ใหม่ใน PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ 
      message: "สมัครสมาชิกสำเร็จ!", 
      user: { id: newUser.id, email: newUser.email } 
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์", error });
  }
};
import jwt from 'jsonwebtoken';

// ฟังก์ชันเข้าสู่ระบบ
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // 1. ค้นหาผู้ใช้จากอีเมลที่ส่งมา
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // 2. ตรวจสอบความถูกต้องของรหัสผ่าน (เทียบรหัสผ่านที่กรอกกับ Hash ในฐานข้อมูล)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // 3. สร้าง JWT Token (กำหนดให้หมดอายุใน 1 วัน)
    const secretKey = process.env.JWT_SECRET || 'your_secret_key_here';
    const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ!",
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์", error });
  }
};