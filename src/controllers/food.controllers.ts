import { Request, Response } from 'express';
import { createFood, totalMacro, deleteFood, getAllFood, getOneFood, updateFood, searchFoods} from '../services/food.services';
import { AuthRequest } from '../middleware/authMiddleware';
 
export const createFoodEntry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, protein, carb, fat, fiber, quantity } = req.body;
        const userId = req.userId;

        if (!userId){
          res.status(401).json({error: `Unauthorized.`});
          return;
        }

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

      if (!userId){
        res.status(401).json({error: `Unauthorized.`});
        return;
      }

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

      if (!userId){
        res.status(401).json({error: `Unauthorized.`});
        return;
      } 

      if (!foodId || isNaN(foodId)){
        res.status(400).json({error: `No food exist with this id.`});
        return;
      }

      if (typeof(foodId) !== 'number' || typeof(userId) !== 'number'){
        res.status(400).json({error: `Food's id must be a number`});
        return;
      }

      const delFood = await deleteFood(foodId, userId);
      res.status(200).json({ message: "Food deleted.", food: delFood });
    } catch (error){
       res.status(500).json({error: `Failed to delete food.`});
       console.error(error);
    }
}

export const getAllFoodEntry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const foods = await getAllFood();

      res.status(200).json(foods);

    } catch (error){
      res.status(500).json({error: `Failed to get all food.`})
      console.error(error);
    }
}

export const getOneFoodEntry = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      if (!id){
        res.status(401).json({error: `No food exist with this id.`});
        return;
      }

      const food = await getOneFood(id);

      res.status(200).json(food);
      
    } catch (error) {
      res.status(500).json({error: `Failed to get food's nutrition.`})
      console.error(error);
    }
}

export const updateFoodEntry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { foodName, protein, carb, fat, fiber, quantity } = req.body;
      const userId = req.userId;
      const id = Number(req.params.id);

      if (!userId){
        res.status(401).json({error: `Unauthorized.`});
        return;
      } 

      if (!id){
        res.status(400).json({error: `No food exist with this id.`});
        return;
      }

      const food = await updateFood({ foodName, protein, carb, fat, fiber, quantity }, userId, id)
      
      res.status(200).json({ entry: food });

    } catch (error) {
      res.status(500).json({error: `Failed to get food's nutrition.`})
      console.error(error);
    }
}

export const searchFoods2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const query = req.query.q;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: "Search query is required." });
      return;
    }

    const foods = await searchFoods(query);

    res.status(200).json({ foods });

  } catch (error) {
    res.status(500).json({ error: "Failed to search foods." });
    console.error(error);
  }
};