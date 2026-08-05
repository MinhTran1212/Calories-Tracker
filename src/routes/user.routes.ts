import { Router } from 'express';
import { createFoodEntry, createUserEntry } from '../controllers/user.controllers';

const router = Router();

router.post("/food", createFoodEntry);
router.post("/user", createUserEntry);

export default router;