import dotenv from "dotenv";
import express from "express";
import { Express } from "express-serve-static-core";
import bodyParser from "body-parser";
import postRouter from "./routes/postRoutes";
import commentRouter from "./routes/commentRoutes";
import mongoose from "mongoose";
dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
app.use(bodyParser.json());
app.use("/post", postRouter);
app.use("/comment", commentRouter);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const initApp = () =>
  new Promise<Express>((resolve, reject) => {
    if (!process.env.DATABASE_URL) {
      reject("DATABASE_URL is not defined in .env file");
    } else {
      mongoose
        .connect(process.env.DATABASE_URL)
        .then(() => {
          resolve(app);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });

export default initApp;
