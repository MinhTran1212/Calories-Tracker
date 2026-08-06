import prisma from "../lib/prisma";
import { Gender } from "../generated/prisma";

export interface CreateFoodInput {
  foodName: string;
  protein: number;  // per 100g
  carb: number;     // per 100g
  fat: number;      // per 100g
  fiber: number;
  quantity: number; // grams
  userId: number;   // or number, depending on your schema
}

export async function createFood(data: CreateFoodInput) {
    const {foodName, protein, carb, fat, fiber, quantity, userId} = data;
    const rawCalories = ((protein * 4) + (carb * 4) + (fat * 9)) * (quantity / 100);
    
    const calories = Math.round(rawCalories);

    return await prisma.food.create({
        data: {
            name: foodName,
            protein,
            carb,
            fat,
            fiber,
            calories,
            grams: quantity,
            userId: userId
        }
    });
}

export async function totalMacro(userId: number, targetDate: Date = new Date()){
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23,59,59,999);

    return await prisma.food.aggregate({
        where: {
            userId: userId,
            createdAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        _sum: {
            protein: true,
            carb: true,
            fat: true,
            fiber: true,
            calories: true,
        },
        _count: {
            id: true
        }
    });
}
