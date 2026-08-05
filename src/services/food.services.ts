import prisma from "../lib/prisma";
import { Gender } from "../generated/prisma";

export interface CreateFoodInput {
  foodName: string;
  protein: number;  // per 100g
  carb: number;     // per 100g
  fat: number;      // per 100g
  quantity: number; // grams
  userId: number;   // or number, depending on your schema
}

export async function createFood(data: CreateFoodInput) {
    const {foodName, quantity, protein, carb, fat, userId} = data;
    const rawCalories = ((protein * 4) + (carb * 4) + (fat * 9)) * (quantity / 100);
    
    const calories = Math.round(rawCalories);

    return await prisma.food.create({
        data: {
            name: foodName,
            protein,
            carb,
            fat,
            calories,
            grams: quantity,
            userId: userId
        }
    });
}
