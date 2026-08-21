import { Request, Response } from 'express';
import { createUser, logIn, getProfile, updateProfile } from '../services/user.services';
import { Gender } from '../generated/prisma';
import jwt from "jsonwebtoken";
import { AuthRequest } from '../middleware/authMiddleware';

interface LoginResult {
  success: boolean;
  user?: { id: string; email: string };
  message?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const createUserEntry = async(req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, weight, height, gender, age, workoutIntensity } = req.body;
    if ( !name || !email || !gender || (gender !== Gender.MALE && gender !== Gender.FEMALE)){
      res.status(400).json({error: `name, email must exist and gender must be MALE or FEMALE.`});
      return;
    } else if (typeof weight !== 'number' || weight < 30 || weight > 200 ||
      typeof height !== 'number' || height < 80 || height > 250 ||
      typeof age !== 'number' || age <= 0 || age > 100 ||
      typeof workoutIntensity !== 'number' || workoutIntensity < 1.2 || workoutIntensity > 1.9
    ){
      res.status(400).json({error: `Invalid or missing parameters. Personal information must be valid numbers.`});
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Invalid email format." });
      return;
    }
    
    const log = await createUser(name, email, password, weight, height, gender, age, workoutIntensity);

    const token = jwt.sign(
      {userId: log.id},
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(200).json({log, token});
  } catch (error){
    res.status(500).json({error: `Failed to create user log entry`});
    console.error(error);
  }
}

export const logInEntry = async(req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password){
      res.status(400).json({error: `Email and pass is required.`});
      return;
    }

    const user = await logIn(email, password);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = jwt.sign(
      {userId: user.id},
      process.env.JWT_SECRET!,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      token,
      user: { id: user.id, email: user.email }
    });


  } catch (error){
    res.status(500).json({error: `Failed to log in. Please try again.`});
    console.error(error);
  }
}

export const getProfileInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.userId);

    if (!userId){
      res.status(401).json({error: `Unauthorized`});
      return;
    }

    const user = await getProfile(userId);

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json(user);
  } catch (error){
    res.status(500).json({error: `Failed to get user's information.`})
    console.error(error);
  }
}

export const updateProfile2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.userId); 
    const { name, email, password, weight, height, gender, age, workoutIntensity } = req.body;

    if (name !== undefined && typeof name !== 'string') {
      res.status(400).json({ error: "Name must be a string." });
      return;
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: "Invalid email format." });
        return;
      }
    }

    if (password !== undefined && typeof password !== 'string') {
      res.status(400).json({ error: "Password must be a string." });
      return;
    }

    if (weight !== undefined && (typeof weight !== 'number' || weight <= 0)) {
      res.status(400).json({ error: "Weight must be a positive number." });
      return;
    }

    if (height !== undefined && (typeof height !== 'number' || height <= 0)) {
      res.status(400).json({ error: "Height must be a positive number." });
      return;
    }

    if (gender !== undefined && gender !== 'MALE' && gender !== 'FEMALE') {
      res.status(400).json({ error: "Gender must be MALE or FEMALE." });
      return;
    }

    if (age !== undefined && (typeof age !== 'number' || age <= 0 || !Number.isInteger(age))) {
      res.status(400).json({ error: "Age must be a positive whole number." });
      return;
    }

    if (workoutIntensity !== undefined && (typeof workoutIntensity !== 'number' || workoutIntensity < 0)) {
      res.status(400).json({ error: "Workout intensity must be a valid number." });
      return;
    }

    if (!userId){
      res.status(401).json({error: `Unauthorized`});
      return;
    }

    const update = await updateProfile(userId, { name, email, password, weight, height, gender, age, workoutIntensity });

    if (!update) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json(update);

  } catch(error){
    res.status(500).json({error: `Failed to update user's information.`})
    console.error(error);
  }
}