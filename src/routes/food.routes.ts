import { Router } from 'express';
import { createFoodEntry } from '../controllers/food.controllers';

const router = Router();

router.post("/food", createFoodEntry);

export default router;