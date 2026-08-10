import express from 'express';
import path from 'path';
import prisma from "./lib/prisma";
import userRouter from "./routes/user.routes";
import foodRouter from "./routes/food.routes";
import entryRouter from "./routes/entry.routes";

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/user', userRouter);
app.use('/food', foodRouter);
app.use('/entry', entryRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Calorie tracker backend running on path http://localhost:${PORT}`);
});