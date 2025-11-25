import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { z } from 'zod';

export const authRouter = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = loginSchema.parse(req.body);

    console.log('Searching for user:', email);
    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log('User found:', !!user);

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Неверные учетные данные' });
      return;
    }

    // Проверить пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Неверные учетные данные' });
      return;
    }

    // Генерировать токен
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Отправить данные пользователя без пароля
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Неверные данные', details: error.errors });
      return;
    }
    res.status(500).json({ 
      error: 'Ошибка сервера',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/auth/me - получить текущего пользователя
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    // Здесь будет middleware аутентификации
    res.json({ message: 'Not implemented yet' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
