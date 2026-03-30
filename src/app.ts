import express, { Express, Request, Response } from "express";
import indexRoutes from './indexRoutes';
import dotenv from 'dotenv';
dotenv.config();

const cors = require('cors');

const app: Express = express();
app.use(express.json({limit:"15mb"}));

app.use(cors({
  origin: "*",
  allowedHeaders: ["Authorization", "Content-Type"],
  exposedHeaders: ["Authorization"]
}));


app.get("/", (req: Request, res: Response) => {
  res.sendStatus(401);
});

app.get("/ping", (req: Request, res: Response) => {
  res.status(200).send("pong");
});

app.use(indexRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`[SERVER] running at http://localhost:${port}`);
});