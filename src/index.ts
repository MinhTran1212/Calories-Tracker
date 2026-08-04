import express from 'express';
import prisma from "./lib/prisma";
import userRouter from "./routes/user.routes";

const app = express();
app.use(express.json());

app.use('/logging', userRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Calorie tracker backend running on path http://localhost:${PORT}`);
});