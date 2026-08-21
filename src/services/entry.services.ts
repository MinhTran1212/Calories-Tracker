import { Request, Response } from 'express';
import prisma from "../lib/prisma";

interface UpdateEntry {
    foodId: number,
    quantity: number
}

export async function createEntry(userId: number, foodId: number, quantity: number){
    if (!userId){
        return null;
    }

    if (!foodId){
        return null;
    }

    if (!quantity){
        return null;
    }

    return await prisma.entry.create({
        data: {
            userId: userId,
            foodId: foodId,
            quantity: quantity
        }
    })
}

export function scaleNutrition(food: { id: number; name: string ; grams: number; protein: number; carb: number; fat: number; fiber: number; calories: number }, entryId: number, multiplier: number) {
  return {
    id: entryId,
    foodId: food.id,
    quantity: multiplier,
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
        return null;
    }

    if (!entryId){
        return null;
    }

    const entry = await prisma.entry.findFirst({
        where: {
            id: entryId,
            userId: userId
        },
        include: { food: true }
    });

    if (!entry){
        return null;
    }

    if (userId !== entry?.userId){
        return null;
    }

    const multiplier = entry?.quantity;

    return scaleNutrition(entry.food, entry.id, multiplier);
}


export async function getEntriesForDay(userId: number, targetDate: Date = new Date()){
    if (!userId){
        return null;
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
    return null;
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
      acc.protein += Math.round(entry.food.protein * multiplier);
      acc.carb += Math.round(entry.food.carb * multiplier);
      acc.fat += Math.round(entry.food.fat * multiplier);
      acc.fiber += Math.round(entry.food.fiber * multiplier);
      acc.calories += Math.round(entry.food.calories * multiplier);
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
        return null;
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
        return null;
    }

    if (!id){
        return null;
    }

    const entry = await prisma.entry.findUnique({
        where: { id: id }
    });

    if (!entry){
        return null;
    }

    if (entry.userId !== userId){
        return null;
    }

    return await prisma.entry.update({
        where: {
            id: id,
            userId: userId
        },
        data
    });
}

export async function deleteEntry(userId: number, id: number){
    if (!userId){
        return null;
    }

    if (!id){
        return null;
    }

    const entry = await prisma.entry.findUnique({
        where: { id: id }
    });

    if (!entry){
        return null;
    }

    if (entry.userId !== userId){
        return null;
    }

    return await prisma.entry.delete({
        where: {
            id: id,
            userId: userId
        }
    });
}
