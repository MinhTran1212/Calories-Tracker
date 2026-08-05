import { Router } from 'express';
import { createFoodEntry } from '../controllers/food.controllers';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post("/food", requireAuth, createFoodEntry);

export default router;