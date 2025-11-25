import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

export const mortgageRouter = Router();
mortgageRouter.use(authenticate);

// POST /api/mortgage/calculate - расчет ипотеки
mortgageRouter.post('/calculate', async (req, res) => {
  res.json({ message: 'Mortgage calculation - coming soon' });
});
