import { Router } from 'express';
import { createFoodEntry, totalMacroEntry, deleteFoodEntry } from '../controllers/food.controllers';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post("/logging", requireAuth, createFoodEntry);
router.post("/summacro", requireAuth, totalMacroEntry);
router.delete("/:id", requireAuth, deleteFoodEntry);

export default router;