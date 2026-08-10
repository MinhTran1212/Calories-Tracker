import { Router } from 'express';
import { createFoodEntry, totalMacroEntry, deleteFoodEntry, getAllFoodEntry, getOneFoodEntry, updateFoodEntry, searchFoods2 } from '../controllers/food.controllers';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post("/create", requireAuth, createFoodEntry);
router.post("/summacro", requireAuth, totalMacroEntry);
router.delete("/:id", requireAuth, deleteFoodEntry);
router.get("/all", getAllFoodEntry);
router.patch("/:id", requireAuth, updateFoodEntry);
router.get("/search", requireAuth, searchFoods2);
router.get("/:id", getOneFoodEntry);

export default router;