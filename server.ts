import express from "express";
import { Express } from "express-serve-static-core";
import { connectToDatabase } from "./db";
import bodyParser from "body-parser";
import postRouter from "./routes/postRoutes";
import commentRouter from "./routes/commentRoutes";

const promiseApp = new Promise<Express>(async (resolve, reject) => {
  try {
    await connectToDatabase();
    const app = express();

    app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
    app.use(bodyParser.json());

    app.use("/post", postRouter);
    app.use("/comment", commentRouter);
    resolve(app);
  } catch (error) {
    console.error(error);
    reject(error);
  }
});

export default promiseApp;
