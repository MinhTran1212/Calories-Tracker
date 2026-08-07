import { Router } from 'express';
import { createUserEntry, logInEntry, getProfileInfo } from '../controllers/user.controllers';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post("/register", createUserEntry);
router.post("/login", logInEntry);
router.get("/getprofile", requireAuth, getProfileInfo);
export default router;