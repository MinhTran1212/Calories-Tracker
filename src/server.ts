// src/server.ts
import { app } from './index';

const PORT = process.env.PORT || 3000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Calorie tracker backend running on http://0.0.0.0:${PORT}`);
});