import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerFMID, addPayments } from './controllers/paymentRecord.controller.js';
dotenv.config();
const PORT = 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.post('/payment-records', registerFMID);
app.post('/payment-records/multiple', addPayments);

app.listen(PORT, () => {
  console.log('Server running on http://localhost:',PORT);
});
