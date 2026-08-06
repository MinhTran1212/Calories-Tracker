import express from 'express';
import prisma from "./lib/prisma";
import userRouter from "./routes/user.routes";
import foodRouter from "./routes/food.routes";

const app = express();
app.use(express.json());

app.use('/user', userRouter);
app.use('/food', foodRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Calorie tracker backend running on path http://localhost:${PORT}`);
});