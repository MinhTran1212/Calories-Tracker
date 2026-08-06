import { Request, Response } from 'express';
import { createFood, totalMacro, deleteFood } from '../services/food.services';

import { AuthRequest } from '../middleware/authMiddleware';

export const createFoodEntry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, protein, carb, fat, fiber, quantity } = req.body;
        const userId = req.userId;
        if (
          !name ||
          typeof protein !== 'number' || protein < 0 ||
          typeof carb !== 'number' || carb < 0 ||
          typeof fat !== 'number' || fat < 0 ||
          typeof fiber !== 'number' || fiber < 0 ||
          !quantity || quantity <= 0
        ) {
          res.status(400).json({ error: 'Invalid or missing parameters. Macros and quantity must be valid numbers.' });
          return;
        }
        const log = await createFood({
          foodName: name,
          protein: protein,
          carb: carb,
          fat: fat, 
          fiber: fiber,
          quantity: quantity,
          userId: Number(userId)
        });
        res.status(200).json(log);
    } catch (error){
        res.status(500).json({error: `Failed to create food log entry.`});
        console.error(error);
    }
}

export const totalMacroEntry = async (req: AuthRequest, res:Response): Promise<void> => {
    try {
      const userId = req.userId;
      const sumMacro = await totalMacro(Number(userId));
      res.status(200).json(sumMacro);
    } catch (error){
      res.status(500).json({error: `Failed to sum macro`}); 
      console.error(error);
    }
}

export const deleteFoodEntry =  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const foodId = Number(req.params.id);

      if (typeof(foodId) !== 'number' || typeof(userId) !== 'number'){
        res.status(400).json({error: `Food's id must be a number`});
        return;
      }

      const delFood = await deleteFood(foodId, userId);
      res.status(200).json(delFood);
    } catch (error){
       res.status(500).json({error: `Failed to delete food.`});
       console.error(error);
    }
}