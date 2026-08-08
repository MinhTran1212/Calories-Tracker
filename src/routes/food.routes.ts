import { Router } from 'express';
import { createFoodEntry, totalMacroEntry, deleteFoodEntry, getAllFoodEntry, getOneFoodEntry, updateFoodEntry } from '../controllers/food.controllers';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post("/create", requireAuth, createFoodEntry);
router.post("/summacro", requireAuth, totalMacroEntry);
router.delete("/:id", requireAuth, deleteFoodEntry);
router.get("/all", requireAuth, getAllFoodEntry);
router.get("/:id", requireAuth, getOneFoodEntry);
router.patch("/:id", requireAuth, updateFoodEntry);

export default router;