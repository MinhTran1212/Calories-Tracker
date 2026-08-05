import { Request, Response } from 'express';
import { createUser } from '../services/user.services';
import { Gender } from '../generated/prisma';
import jwt from "jsonwebtoken";

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