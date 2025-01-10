import dotenv from "dotenv";
import express from "express";
import { Express } from "express-serve-static-core";
import bodyParser from "body-parser";
import postRouter from "./routes/postRoutes";
import commentRouter from "./routes/commentRoutes";
import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import mongoose from "mongoose";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SECOND ASSIGNMENT REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
    servers: [{ url: "http://localhost:3000", },],
  },
  apis: ["./routes/*.ts"],
};
const specs = swaggerJsDoc(swaggerOptions);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
app.use(bodyParser.json());
app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);

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
