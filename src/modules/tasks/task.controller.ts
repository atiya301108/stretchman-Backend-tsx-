import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. ดึงรายการ Task ทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
export const getTasks = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      message: "ดึงรายการภารกิจสำเร็จ!",
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์", error });
  }
};

// 2. สร้าง Task ใหม่
export const createTask = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "กรุณาระบุชื่อภารกิจ (title)" });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        userId: userId as number,
      },
    });

    res.status(201).json({
      message: "สร้างภารกิจสำเร็จ!",
      task: newTask,
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์", error });
  }
};
// 3. อัปเดตสถานะ Task (เช่น เปลี่ยนเครื่องหมายถูกว่าทำเสร็จแล้ว)
export const updateTask = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const taskId = Number(req.params.id);
    const { title, description, completed } = req.body;

    // เช็กก่อนว่า Task นี้เป็นของผู้ใช้คนนี้จริงๆ ไหม เพื่อความปลอดภัย
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      return res.status(404).json({ message: "ไม่พบภารกิจนี้ หรือคุณไม่มีสิทธิ์แก้ไข" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title !== undefined ? title : existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        completed: completed !== undefined ? completed : existingTask.completed,
      },
    });

    res.status(200).json({
      message: "อัปเดตภารกิจสำเร็จ!",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์", error });
  }
};

// 4. ลบ Task
export const deleteTask = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.userId;
    const taskId = Number(req.params.id);

    // เช็กสิทธิ์ความเป็นเจ้าของก่อนลบ
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!existingTask) {
      return res.status(404).json({ message: "ไม่พบภารกิจนี้ หรือคุณไม่มีสิทธิ์ลบ" });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    res.status(200).json({
      message: "ลบภารกิจสำเร็จ!",
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดบนเซิร์ฟเวอร์", error });
  }
};