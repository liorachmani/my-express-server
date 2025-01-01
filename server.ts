import express from "express";
import dotenv from "dotenv";
dotenv.config();
import "./db";
import bodyParser from "body-parser";
import postRouter from "./routes/postRoutes";
import commentRouter from "./routes/commentRoutes";
import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes"

const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));
app.use(bodyParser.json());

app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
