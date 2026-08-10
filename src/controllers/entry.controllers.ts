import { AuthRequest } from '../middleware/authMiddleware';
import { Request, Response } from 'express';
import { createEntry, getEntryWithNutrtion, scaleNutrition, getEntriesForDay, getDailyTotals, getEntriesBreakdownForDay, updateEntry, deleteEntry } from '../services/entry.services';
import prisma from '../lib/prisma';

export const createEntry2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const { foodId, quantity } = req.body;

    if (!foodId || !quantity || typeof foodId !== 'number' || typeof quantity !== 'number') {
      res.status(400).json({ error: "Invalid or missing parameters. foodId and quantity must be valid numbers." });
      return;
    }

    const entry = await createEntry(userId, foodId, quantity);

    res.status(201).json({ entry });

  } catch (error) {
    res.status(500).json({ error: "Failed to create entry." });
    console.error(error);
  }
};

export const getEntryWithNutrtion2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.userId);
    const entryId = Number(req.params.id);

    if (!userId){
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    if (!entryId){
      res.status(400).json({ error: "need params"});
    }

    const entry = await getEntryWithNutrtion(userId, entryId);

    res.status(200).send(entry);
  } catch (error){
    res.status(500).json({error: `Failed to get entry nutrition`});
    console.error(error);
  }
}

export const getEntriesForDay2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
     if (!userId){
      res.status(402).json({error: `Unauthorized.`});
      return;
     }
     
     const entries  = await getEntriesForDay(userId);
     res.status(200).json(entries);
    
  } catch (error) {
    res.status(500).json({error: `Failed to get entries for the day`});
    console.error(error);
  }
}

export const getDailyTotals2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const dateParam = req.query.date;
    const targetDate = dateParam ? new Date(dateParam as string) : new Date();

    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: "Invalid date." });
      return;
    }

    const totals = await getDailyTotals(userId, targetDate);

    res.status(200).json({ totals });

  } catch (error) {
    res.status(500).json({ error: "Failed to get daily totals." });
    console.error(error);
  }
};

export const getEntriesBreakdownForDay2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const dateParam = req.query.date;
    const targetDate = dateParam ? new Date(dateParam as string) : new Date();

    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: "Invalid date." });
      return;
    }
    const entries = await getEntriesBreakdownForDay(userId, targetDate);

    res.status(200).json(entries);
  } catch (error){
    console.error(error);
    res.status(500).json({error: `Failed to get nutrition of each meal.`})
  }

}

export const updateEntry2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const entryId = Number(req.params.id);

    if (!entryId || isNaN(entryId)) {
      res.status(400).json({ error: "Invalid entry id." });
      return;
    }

    const { foodId, quantity } = req.body;

    if (!quantity || typeof quantity !== 'number' || !foodId || typeof foodId !== 'number') {
      res.status(400).json({ error: "Quantity and food's ID must be a valid number." });
      return;
    }

    const entry = updateEntry(userId, entryId, {foodId, quantity});

    res.status(200).json({ entry: entry });
  } catch (error) {
    res.status(500).json({error: `Failed to update entry.`})
    console.error(error);
  }
}

export const deleteEntry2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const entryId = Number(req.params.id);

    if (!entryId || isNaN(entryId)) {
      res.status(400).json({ error: "Invalid entry id." });
      return;
    }

          
    const delEntry = deleteEntry(userId, entryId);
    res.status(200).json({ message: "Food deleted.", food: delEntry });

  } catch (error) {
    res.status(500).json({error: `Failed to delete entry.`})
    console.error(error);
  }
}