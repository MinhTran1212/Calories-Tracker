import { Request, Response } from 'express';
import prisma from "../lib/prisma";

interface UpdateEntry {
    foodId: number,
    quantity: number
}

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
    totalGrams: Math.round(food.grams * multiplier),
    protein: Math.round(food.protein * multiplier),
    carb: Math.round(food.carb * multiplier),
    fat: Math.round(food.fat * multiplier),
    fiber: Math.round(food.fiber * multiplier),
    calories: Math.round(food.calories * multiplier),
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


export async function getEntriesForDay(userId: number, targetDate: Date = new Date()){
    if (!userId){
        throw new Error(`User does not exist.`);
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23,59,59,999);

    const entries = await prisma.entry.findMany({
        where: {
            userId: userId,
            createdAt: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    })

     return entries;
}

export async function getDailyTotals(userId: number, targetDate: Date = new Date()) {
  if (!userId) {
    throw new Error("This user does not exist.");
  }

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const entries = await prisma.entry.findMany({
    where: {
      userId,
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
    include: { food: true },
  });

  const totals = entries.reduce(
    (acc, entry) => {
      const multiplier = entry.quantity;
      acc.protein += entry.food.protein * multiplier;
      acc.carb += entry.food.carb * multiplier;
      acc.fat += entry.food.fat * multiplier;
      acc.fiber += entry.food.fiber * multiplier;
      acc.calories += entry.food.calories * multiplier;
      return acc;
    },
    { protein: 0, carb: 0, fat: 0, fiber: 0, calories: 0 }
  );

  return {
    ...totals,
    count: entries.length,
  };
}

export async function getEntriesBreakdownForDay(userId: number, targetDate: Date = new Date()){
    if (!userId){
        throw new Error(`User does not exist.`);
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23,59,59,999);

    const entries = await prisma.entry.findMany({
        where: {
            userId: userId,
            createdAt: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        include: { food: true }
    })

     return entries.map((entry) => scaleNutrition(entry.food, entry.id, entry.quantity));
}

export async function updateEntry(userId: number, id: number, data: UpdateEntry){
    if (!userId){
        throw new Error(`This user does not exist.`);
    }

    if (!id){
        throw new Error(`The user with this id does not exist.`);
    }

    const entry = await prisma.entry.findUnique({
        where: { id: id }
    });

    if (!entry){
        throw new Error(`Cannot find user with this id`);
    }

    if (userId !== entry.userId){
        throw new Error(`Forbidden`);
    }

    return await prisma.entry.update({
        where: {
            id: id
        },
        data
    });
}

export async function deleteEntry(userId: number, id: number){
    if (!userId){
        throw new Error(`This user does not exist.`);
    }

    if (!id){
        throw new Error(`The user with this id does not exist.`);
    }

    const entry = await prisma.entry.findUnique({
        where: { id: id }
    });

    if (!entry){
        throw new Error(`Cannot find user with this id`);
    }

    if (userId !== entry.userId){
        throw new Error(`Forbidden`);
    }

    return await prisma.entry.delete({
        where: {
            id: id
        }
    });
}