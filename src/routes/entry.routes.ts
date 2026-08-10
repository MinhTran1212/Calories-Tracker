import Router from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { createEntry2, getEntryWithNutrtion2 } from '../controllers/entry.controllers';

const router = Router();

router.post("/create", requireAuth, createEntry2);
router.get("/getnutrition/:id", requireAuth, getEntryWithNutrtion2);

export default router;