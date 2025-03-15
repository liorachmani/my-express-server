import request from "supertest";
import initApp from "../server";
import * as core from "express-serve-static-core";

describe("File Tests", () => {
  let app: core.Express;
  beforeAll(async () => {
    app = await initApp();
  });

  test("upload file", async () => {
    const filePath = `${__dirname}/pizza.png`;

    try {
      const response = await request(app)
        .post("/file?file=pizza.png")
        .attach("file", filePath);
      expect(response.statusCode).toEqual(200);
      let url = response.body.url;
      url = url.replace(/^.*\/\/[^/]+/, "");
      const res = await request(app).get(url);
      expect(res.statusCode).toEqual(200);
    } catch (err) {
      expect(1).toEqual(2);
    }
  });
});
