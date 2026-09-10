import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ขยายรูปแบบ Request ของ Express ให้รองรับการแนบข้อมูล user เข้าไปได้
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): any => {
  try {
    // 1. ดึง Header ที่ชื่อว่า Authorization ออกมา
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "ไม่พบ Token สำหรับยืนยันตัวตน, กรุณาเข้าสู่ระบบก่อน" });
    }

    // 2. ตัดคำว่า "Bearer " ออก เพื่อเอาเฉพาะตัวรหัส Token
    const token = authHeader.split(' ')[1];

    // 3. ตรวจสอบความถูกต้องของ Token ด้วยคีย์ลับ (JWT_SECRET)
    const secretKey = process.env.JWT_SECRET || 'your_secret_key_here';
    
    const decoded = jwt.verify(token, secretKey) as { userId: number; email: string };

    // 4. แนบข้อมูลผู้ใช้ไปกับ Request เพื่อให้ฟังก์ชันถัดไปหยิบไปใช้ต่อได้
    req.user = decoded;

    // 5. ผ่านไปทำงานฟังก์ชันถัดไปได้
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token ไม่ถูกต้องหรือหมดอายุแล้ว" });
  }
};