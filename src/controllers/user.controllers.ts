import { Request, Response } from 'express';
import { createUser, logIn } from '../services/user.services';
import { Gender } from '../generated/prisma';
import jwt from "jsonwebtoken";
import { AuthRequest } from '../middleware/authMiddleware';

interface LoginResult {
  success: boolean;
  user?: { id: string; email: string };
  message?: string;
}

export const createUserEntry = async(req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, weight, height, gender, age, workoutIntensity } = req.body;
    if ( !name || !email || !gender || (gender !== Gender.MALE && gender !== Gender.FEMALE)){
      res.status(200).json({error: `name, email must exist and gender must be MALE or FEMALE.`});
      return;
    } else if (typeof weight !== 'number' || weight < 30 || weight > 200 ||
      typeof height !== 'number' || height < 80 || height > 250 ||
      typeof age !== 'number' || age <= 0 || age > 100 ||
      typeof workoutIntensity !== 'number' || workoutIntensity < 1.2 || workoutIntensity > 1.9
    ){
      res.status(200).json({error: `Invalid or missing parameters. Personal information must be valid numbers.`});
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