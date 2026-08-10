import Router from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { createEntry2,
        getEntryWithNutrtion2, 
        getEntriesForDay2, 
        getDailyTotals2,
        getEntriesBreakdownForDay2,
        updateEntry2,
        deleteEntry2 } from '../controllers/entry.controllers';

const router = Router();

router.post("/create", requireAuth, createEntry2);
router.get("/getnutrition/:id", requireAuth, getEntryWithNutrtion2);
router.get("/getentries", requireAuth, getEntriesForDay2);
router.get("/totals", requireAuth, getDailyTotals2);
router.get("/breakdown", requireAuth, getEntriesBreakdownForDay2);
router.patch("/update/:id", requireAuth, updateEntry2);
router.delete("/:id", requireAuth, deleteEntry2);

export default router;