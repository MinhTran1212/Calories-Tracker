import { Request, Response } from 'express';
import {createFood } from '../services/food.services';

export const createFoodEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, quantity, protein, carb, fat } = req.body;
        if (
          !name ||
          typeof protein !== 'number' || protein < 0 ||
          typeof carb !== 'number' || carb < 0 ||
          typeof fat !== 'number' || fat < 0 ||
          !quantity || quantity <= 0
        ) {
          res.status(400).json({ error: 'Invalid or missing parameters. Macros and quantity must be valid numbers.' });
          return;
        }
        const log = await createFood(name, protein, carb, fat, quantity);
        res.status(200).json(log);
    } catch (error){
        res.status(500).json({error: `Failed to create food log entry.`});
        console.error(error);
    }
}