import { Router } from 'express';
import { createUserEntry, logInEntry, getProfileInfo, updateProfile2 } from '../controllers/user.controllers';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post("/register", createUserEntry);
router.post("/login", logInEntry);
router.get("/getprofile", requireAuth, getProfileInfo);
router.patch("/update", requireAuth, updateProfile2);
export default router;