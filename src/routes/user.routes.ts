import { Router } from 'express';
import { createFoodEntry } from '../controllers/user.controllers';

const router = Router();

router.post("/food", createFoodEntry);

export default router;