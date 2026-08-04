import prisma from "../lib/prisma";

export async function createFood(
    foodName: string, 
    quantity: number, 
    protein: number, 
    carb: number, 
    fat: number
) {
    const rawCalories = ((protein * 4) + (carb * 4) + (fat * 9)) * (quantity / 100);
    
    const calories = Math.round(rawCalories);

    return await prisma.food.create({
        data: {
            name: foodName,
            protein,
            carb,
            fat,
            calories,
            grams: quantity 
        }
    });
}
