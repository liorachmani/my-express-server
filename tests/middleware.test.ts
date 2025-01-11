import { authenticate } from "../middlewares";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

jest.mock("jsonwebtoken");

describe("authenticate middleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    next = jest.fn() as NextFunction;

    process.env.SERVER_ACCESS_TOKEN_SECRET = "test-secret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if no authorization header is provided", async () => {
    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Access denied!");
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 500 if SERVER_ACCESS_TOKEN_SECRET is not set", async () => {
    delete process.env.SERVER_ACCESS_TOKEN_SECRET;
    req.headers["authorization"] = "Bearer test-token";

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Internal Server Error");
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if token verification fails", async () => {
    req.headers["authorization"] = "Bearer test-token";
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(new Error("Invalid token"), null);
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith("Invalid token");
    expect(next).not.toHaveBeenCalled();
  });

  it("should set req.user and call next if token is valid", async () => {
    req.headers["authorization"] = "Bearer test-token";
    const mockPayload = { id: 1, name: "Test User" };

    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, mockPayload);
    });

    await authenticate(req, res, next);

    expect(req.user).toEqual(mockPayload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });
});
