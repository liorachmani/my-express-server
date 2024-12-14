import dotenv from "dotenv";
dotenv.config();
import promiseApp from "./server";

const PORT = process.env.PORT || 3000;

promiseApp.then((app) => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
