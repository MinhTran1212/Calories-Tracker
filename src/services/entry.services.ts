import { Request, Response } from 'express';
import prisma from "../lib/prisma";

export async function createEntry(userId: number, foodId: number, quantity: number){
    if (!userId){
        throw new Error(`The user with this id does not exist`);
    }

    if (!foodId){
        throw new Error(`The food with this id does not exist`);
    }

    if (!quantity){
        throw new Error(`Need quantity.`)
    }

    return await prisma.entry.create({
        data: {
            userId: userId,
            foodId: foodId,
            quantity: quantity
        }
    })
}

export function scaleNutrition(food: { name: string ; grams: number; protein: number; carb: number; fat: number; fiber: number; calories: number }, entryId: number, multiplier: number) {
  return {
    id: entryId,
    name: food.name,
    totalGrams: food.grams * multiplier,
    protein: food.protein * multiplier,
    carb: food.carb * multiplier,
    fat: food.fat * multiplier,
    fiber: food.fiber * multiplier,
    calories: food.calories * multiplier,
  };
}

export async function getEntryWithNutrtion(userId: number, entryId: number){
    if (!userId){
        throw new Error(`User does not exist.`);
    }

    if (!entryId){
        throw new Error(`Entry does not exist`);
    }

    const entry = await prisma.entry.findFirst({
        where: {
            id: entryId,
            userId: userId
        },
        include: { food: true }
    });

    if (!entry){
        throw new Error(`Entry does not exist.`)
    }

    if (userId !== entry?.userId){
        throw new Error(`Forbidden`);
    }

    const multiplier = entry?.quantity;

    return scaleNutrition(entry.food, entry.id, multiplier);
}
