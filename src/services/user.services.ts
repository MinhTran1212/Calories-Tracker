import prisma from "../lib/prisma";
import { Gender } from "../generated/prisma";

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

export async function createUser(
    name: string,
    email: string, 
    weight: number,
    height: number,
    gender: Gender,
    age: number, 
    workoutIntensity: number
){
    let bmr = 0;
    
    if (gender == Gender.MALE){
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + (5 * age) + 5
    } else if (gender == Gender.FEMALE){
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + (5 * age) - 161
    }

    const tdee = Math.round(bmr * workoutIntensity);
    return await prisma.user.create({
        data: {
            name: name,
            email: email,
            tdee: tdee,
            weight: weight,
            height: height,
            gender: gender,
            age: age,
            workoutIntensity: workoutIntensity
        }
    });


}