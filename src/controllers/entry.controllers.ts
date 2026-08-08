import { AuthRequest } from '../middleware/authMiddleware';
import { Request, Response } from 'express';
import { createEntry } from '../services/entry.services';
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