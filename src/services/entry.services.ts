import { Request, Response } from 'express';
import prisma from "../lib/prisma";

export async function createEntry(userId: number, foodId: number, quantity: number){
    if (!userId){
        throw new Error(`The user with this id does not exist`);
    }

    if (!foodId){
        throw new Error(`The food with this id does not exist`);
    }

    return await prisma.entry.create({
        data: {
            userId: userId,
            foodId: foodId,
            quantity: quantity
        }
    })
}
