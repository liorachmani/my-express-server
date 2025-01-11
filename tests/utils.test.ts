import jwt from "jsonwebtoken";
import { createToken, verifyToken, TOKEN_TYPE } from "../utils";
import User from "../models/user";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
jest.mock("jsonwebtoken");
jest.mock("../models/user");

describe("Utilities", () => {
  describe("Token Utilities", () => {
    const OLD_ENV = process.env;
    const mockUserId = new mongoose.Types.ObjectId();
    const mockRefreshToken = "mock-refresh-token";

    beforeEach(() => {
      jest.resetModules();
      process.env.SERVER_ACCESS_TOKEN_SECRET = "access-secret";
      process.env.SERVER_ACCESS_TOKEN_EXPIRATION = "1h";
      process.env.SERVER_REFRESH_TOKEN_SECRET = "refresh-secret";
      process.env.SERVER_REFRESH_TOKEN_EXPIRATION = "7d";

      jest.clearAllMocks();
    });

    afterAll(() => {
      process.env = { ...OLD_ENV };
    });

    describe("createToken", () => {
      it("should return a signed token for ACCESS_TOKEN", () => {
        (jwt.sign as jest.Mock).mockReturnValue("mock-access-token");

        const token = createToken(mockUserId, TOKEN_TYPE.ACCESS_TOKEN);

        expect(jwt.sign).toHaveBeenCalledWith(
          { id: mockUserId, timestamp: expect.any(Number) },
          expect.any(String),
          { expiresIn: "1h" }
        );
        expect(token).toBe("mock-access-token");
      });

      it("should return a signed token for REFRESH_TOKEN", () => {
        (jwt.sign as jest.Mock).mockReturnValue("mock-refresh-token");

        const token = createToken(mockUserId, TOKEN_TYPE.REFRESH_TOKEN);

        expect(jwt.sign).toHaveBeenCalledWith(
          { id: mockUserId, timestamp: expect.any(Number) },
          expect.any(String),
          { expiresIn: "7d" }
        );
        expect(token).toBe("mock-refresh-token");
      });
    });

    describe("verifyToken", () => {
      it("should reject if refresh token secret is missing", async () => {
        delete process.env.SERVER_REFRESH_TOKEN_SECRET;

        await expect(verifyToken(mockRefreshToken)).rejects.toBe(
          "Missing auth secret"
        );
      });

      it("should reject if no refresh token is provided", async () => {
        await expect(verifyToken("")).rejects.toBe("No refresh token");
      });

      it("should reject if token verification fails", async () => {
        (jwt.verify as jest.Mock).mockImplementation(
          (token, secret, callback) => {
            callback(new Error("Invalid token"), null);
          }
        );

        await expect(verifyToken(mockRefreshToken)).rejects.toBe(
          "Invalid token"
        );
      });

      it("should reject if user is not found", async () => {
        (jwt.verify as jest.Mock).mockImplementation(
          (token, secret, callback) => {
            callback(null, { id: mockUserId });
          }
        );
        (User.findById as jest.Mock).mockResolvedValue(null);

        await expect(verifyToken(mockRefreshToken)).rejects.toBe(
          "Invalid request"
        );
      });

      it("should reject if refresh token is not in user's tokens", async () => {
        (jwt.verify as jest.Mock).mockImplementation(
          (token, secret, callback) => {
            callback(null, { id: mockUserId });
          }
        );
        const mockUser = {
          refreshTokens: [],
          save: jest.fn(),
        };
        (User.findById as jest.Mock).mockResolvedValue(mockUser);

        await expect(verifyToken(mockRefreshToken)).rejects.toBe(
          "Invalid request"
        );
        expect(mockUser.save).toHaveBeenCalled();
      });

      it("should resolve with user if refresh token is valid", async () => {
        (jwt.verify as jest.Mock).mockImplementation(
          (token, secret, callback) => {
            callback(null, { id: mockUserId });
          }
        );
        const mockUser = {
          refreshTokens: [mockRefreshToken],
        };
        (User.findById as jest.Mock).mockResolvedValue(mockUser);

        const user = await verifyToken(mockRefreshToken);

        expect(user).toBe(mockUser);
      });
    });
  });
});
