import express from 'express';
import {test } from './lib';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});


app.get('/test', async (req, res) => {
  const response = await test()
  res.json(response);
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
