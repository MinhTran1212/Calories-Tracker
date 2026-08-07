import { Router } from 'express';
import { createUserEntry, logInEntry } from '../controllers/user.controllers';

const router = Router();

router.post("/register", createUserEntry);
router.post("/login", logInEntry);

export default router;