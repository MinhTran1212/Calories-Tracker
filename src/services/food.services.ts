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

export interface UpdateFood {
  foodName: string;
  protein: number;  // per 100g
  carb: number;     // per 100g
  fat: number;      // per 100g
  fiber: number;
  quantity: number; // grams
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

    if (!userId){
        throw new Error(`This user does not exist.`);
    }

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

export async function deleteFood(foodId: number, userId: number){
    const food = await prisma.food.findUnique({
        where: {
            id: foodId,
        }
    });

    if (!food){
        throw new Error("Food not found");
    }

    if (food.userId != userId){
        throw new Error("Forbidden");
    }

    return await prisma.food.delete({
        where: {
            id: foodId
        }
    });
}

export async function getAllFood(userId: number){
    if (!userId){
        throw new Error(`This user does not exist.`);
    }

    const foods = await prisma.food.findMany({
        where: {
            userId: userId
        }
    })

    return foods;
}

export async function getOneFood(id: number){


    if (!id){
        throw new Error(`The food with this id does not exist.`);
    }

    const food = await prisma.food.findFirst({
        where: {
            id: id 
        }
    })

    return food;
}

export async function updateFood(data: UpdateFood, userId: number, id: number){
    if (!id){
        throw new Error(`The food with this id does not exist.`);
    }

    if (!userId){
        throw new Error(`This user does not exist.`);
    }

    const food = await prisma.food.findUnique({
        where: {
            id: id,
        }
    });

    if (!food){
        throw new Error("Food not found");
    }

    if (food.userId != userId){
        throw new Error("Forbidden");
    }



    return await prisma.food.update({
        where: {
            id:  id,
            userId: userId
        },
        data
    });
}


