import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

export const projectsRouter = Router();
projectsRouter.use(authenticate);

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  city: z.string().min(1, 'Город обязателен'),
  address: z.string().min(1, 'Адрес обязателен'),
  class: z.string().optional(),
  deliveryDate: z.string().optional(),
  images: z.array(z.string()).optional(),
});

const updateProjectSchema = createProjectSchema.partial();

// GET /api/projects - список ЖК с фильтрацией
projectsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, search, page = '1', limit = '12' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Фильтр по городу
    if (city) {
      where.city = city;
    }

    // Поиск по названию или адресу
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Застройщики видят только свои проекты
    if (req.user?.role === 'DEVELOPER') {
      where.developerId = req.user.userId;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          developer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              apartments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    // Получаем статистику по квартирам для каждого проекта
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const apartmentStats = await prisma.apartment.groupBy({
          by: ['status'],
          where: { projectId: project.id },
          _count: true,
        });

        const stats = {
          total: project._count.apartments,
          available: apartmentStats.find((s) => s.status === 'AVAILABLE')?._count || 0,
          reserved: apartmentStats.find((s) => s.status === 'RESERVED')?._count || 0,
          sold: apartmentStats.find((s) => s.status === 'SOLD')?._count || 0,
        };

        return {
          ...project,
          apartmentStats: stats,
        };
      })
    );

    res.json({
      projects: projectsWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Ошибка получения списка проектов' });
  }
});

// GET /api/projects/:id - детали проекта
projectsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        developer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        apartments: {
          orderBy: [
            { floor: 'asc' },
            { number: 'asc' },
          ],
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Проект не найден' });
      return;
    }

    // Проверка прав доступа для застройщиков
    if (req.user?.role === 'DEVELOPER' && project.developerId !== req.user.userId) {
      res.status(403).json({ error: 'Доступ запрещен' });
      return;
    }

    // Статистика по квартирам
    const apartmentStats = await prisma.apartment.groupBy({
      by: ['status'],
      where: { projectId: id },
      _count: true,
    });

    const stats = {
      total: project.apartments.length,
      available: apartmentStats.find((s) => s.status === 'AVAILABLE')?._count || 0,
      reserved: apartmentStats.find((s) => s.status === 'RESERVED')?._count || 0,
      sold: apartmentStats.find((s) => s.status === 'SOLD')?._count || 0,
    };

    res.json({
      ...project,
      apartmentStats: stats,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Ошибка получения проекта' });
  }
});

// POST /api/projects - создать ЖК (только для застройщиков и админов)
projectsRouter.post('/', requireRole('DEVELOPER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createProjectSchema.parse(req.body);

    // Для застройщиков автоматически присваиваем их ID
    const developerId = req.user!.role === 'DEVELOPER' ? req.user!.userId : req.body.developerId;

    if (!developerId) {
      res.status(400).json({ error: 'Необходимо указать застройщика' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        ...data,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
        images: data.images || [],
        developerId,
      },
      include: {
        developer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Ошибка валидации', details: error.errors });
      return;
    }
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Ошибка создания проекта' });
  }
});

// PUT /api/projects/:id - обновить проект
projectsRouter.put('/:id', requireRole('DEVELOPER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateProjectSchema.parse(req.body);

    // Проверка существования
    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Проект не найден' });
      return;
    }

    // Проверка прав доступа для застройщиков
    if (req.user?.role === 'DEVELOPER' && existing.developerId !== req.user.userId) {
      res.status(403).json({ error: 'Доступ запрещен' });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
      } as any,
      include: {
        developer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Ошибка валидации', details: error.errors });
      return;
    }
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Ошибка обновления проекта' });
  }
});

// DELETE /api/projects/:id - удалить проект
projectsRouter.delete('/:id', requireRole('DEVELOPER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: { apartments: true },
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Проект не найден' });
      return;
    }

    // Проверка прав доступа для застройщиков
    if (req.user?.role === 'DEVELOPER' && existing.developerId !== req.user.userId) {
      res.status(403).json({ error: 'Доступ запрещен' });
      return;
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({ message: 'Проект успешно удален' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Ошибка удаления проекта' });
  }
});
