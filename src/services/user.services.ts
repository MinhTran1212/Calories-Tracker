import prisma from "../lib/prisma";
import { Gender } from "../generated/prisma";
import bcrypt from "bcrypt";

interface UpdateProfile {
    name: string,
    email: string, 
    password: string,
    weight: number,
    height: number,
    gender: Gender,
    age: number, 
    workoutIntensity: number
}

export async function createUser(
    name: string,
    email: string, 
    password: string,
    weight: number,
    height: number,
    gender: Gender,
    age: number, 
    workoutIntensity: number
){  
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
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
            password: hashedPassword,
            tdee: tdee,
            weight: weight,
            height: height,
            gender: gender,
            age: age,
            workoutIntensity: workoutIntensity
        }
    });
}

export async function logIn(email: string, password: string){
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (!user){
        return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch){
        return null;
    }

    return user;
}

export async function getProfile(userId: number){
    if (!userId) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user){
        return null;
    }

    return user;
}

export async function updateProfile(userId: number, data: UpdateProfile) {
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  const weight = updatedUser.weight;
  const height = updatedUser.height;
  const age = updatedUser.age;
  const workoutIntensity = updatedUser.workoutIntensity;
  const gender = updatedUser.gender;

  let bmr = 0;

  if (gender === Gender.MALE) {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else if (gender === Gender.FEMALE) {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }

  const tdee = Math.round(bmr * workoutIntensity);

  return await prisma.user.update({
    where: { id: userId },
    data: { tdee },
  });
}