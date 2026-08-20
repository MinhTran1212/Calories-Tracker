// src/server.ts
import { app } from './index';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Calorie tracker backend running on path http://localhost:${PORT}`);
});