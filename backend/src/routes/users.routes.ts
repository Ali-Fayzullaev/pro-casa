import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';

export const usersRouter = Router();

// Все роуты требуют аутентификации и роли ADMIN
usersRouter.use(authenticate, requireRole('ADMIN'));

// GET /api/users - список пользователей
usersRouter.get('/', async (req, res) => {
  res.json({ message: 'Users list - coming soon' });
});

// POST /api/users - создать пользователя
usersRouter.post('/', async (req, res) => {
  res.json({ message: 'Create user - coming soon' });
});
