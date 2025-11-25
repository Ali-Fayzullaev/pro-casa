import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

export const clientsRouter = Router();
clientsRouter.use(authenticate);

// Validation schemas
const createClientSchema = z.object({
  iin: z.string().length(12, 'ИИН должен содержать 12 цифр'),
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  middleName: z.string().optional(),
  phone: z.string().min(10, 'Телефон обязателен'),
  email: z.string().email('Неверный email').optional(),
  notes: z.string().optional(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'DEAL_CLOSED', 'REJECTED']).default('NEW'),
});

const updateClientSchema = createClientSchema.partial();

// GET /api/clients - список клиентов с фильтрацией
clientsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, page = '1', limit = '10' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Фильтр по статусу
    if (status) {
      where.status = status;
    }

    // Поиск по имени, фамилии, ИИН или телефону
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { iin: { contains: search as string } },
        { phone: { contains: search as string } },
      ];
    }

    // Фильтр по брокеру (брокеры видят только своих клиентов)
    if (req.user?.role === 'BROKER') {
      where.brokerId = req.user.userId;
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          broker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    res.json({
      clients,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Ошибка получения списка клиентов' });
  }
});

// GET /api/clients/:id - детали клиента
clientsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        broker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        bookings: {
          include: {
            apartment: {
              include: {
                project: true,
              },
            },
          },
        },
        documents: true,
        mortgageCalculations: true,
      },
    });

    if (!client) {
      res.status(404).json({ error: 'Клиент не найден' });
      return;
    }

    // Проверка прав доступа
    if (req.user?.role === 'BROKER' && client.brokerId !== req.user.userId) {
      res.status(403).json({ error: 'Доступ запрещен' });
      return;
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Ошибка получения клиента' });
  }
});

// POST /api/clients - создать клиента
clientsRouter.post('/', requireRole('BROKER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createClientSchema.parse(req.body);

    // Проверка уникальности ИИН
    const existing = await prisma.client.findUnique({
      where: { iin: data.iin },
    });

    if (existing) {
      res.status(400).json({ error: 'Клиент с таким ИИН уже существует' });
      return;
    }

    // Создаем клиента
    const client = await prisma.client.create({
      data: {
        ...data,
        brokerId: req.user!.userId,
      },
      include: {
        broker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Ошибка валидации', details: error.errors });
      return;
    }
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Ошибка создания клиента' });
  }
});

// PUT /api/clients/:id - обновить клиента
clientsRouter.put('/:id', requireRole('BROKER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateClientSchema.parse(req.body);

    // Проверка существования
    const existing = await prisma.client.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Клиент не найден' });
      return;
    }

    // Проверка прав доступа
    if (req.user?.role === 'BROKER' && existing.brokerId !== req.user.userId) {
      res.status(403).json({ error: 'Доступ запрещен' });
      return;
    }

    // Проверка уникальности ИИН (если меняется)
    if (data.iin && data.iin !== existing.iin) {
      const iinExists = await prisma.client.findUnique({
        where: { iin: data.iin },
      });
      if (iinExists) {
        res.status(400).json({ error: 'Клиент с таким ИИН уже существует' });
        return;
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: data as any,
      include: {
        broker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Ошибка валидации', details: error.errors });
      return;
    }
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Ошибка обновления клиента' });
  }
});

// DELETE /api/clients/:id - удалить клиента
clientsRouter.delete('/:id', requireRole('BROKER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.client.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Клиент не найден' });
      return;
    }

    // Проверка прав доступа
    if (req.user?.role === 'BROKER' && existing.brokerId !== req.user.userId) {
      res.status(403).json({ error: 'Доступ запрещен' });
      return;
    }

    await prisma.client.delete({
      where: { id },
    });

    res.json({ message: 'Клиент успешно удален' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Ошибка удаления клиента' });
  }
});
