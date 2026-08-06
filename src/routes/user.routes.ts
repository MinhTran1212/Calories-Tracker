import { Router } from 'express';
import { createUserEntry } from '../controllers/user.controllers';

const router = Router();

router.post("/logging", createUserEntry);

export default router;