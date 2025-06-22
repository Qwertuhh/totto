import brcypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "@/models/user.model";
import inngest from "../inngest/client";
import { Request, Response } from "express";
import logger from "@/utils/logger.utils";
import { Token } from "@/types/index";
import { authenticatedRequest } from "@/types";
import { emailProtection } from "@/utils/IIPProtection";

/**
 * Returns a user object with the password, _id, createdAt, updatedAt, and __v properties removed.
 * @param {IUser} user - The user object to sanitize
 * @returns {IUser} - The sanitized user object
 */
function safeUser(user: IUser) {
  const {
    password: _password,
    _id,
    createdAt,
    updatedAt,
    __v,
    ...safeUser
  } = user.toObject();
  return safeUser;
}
/**
 * Handles creating a new user
 *
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 *
 * @returns {Promise<void>}
 */
const signup = async (req: Request, res: Response) => {
  const { name, email, password, skills } = req.body;
  if (!email || !password) {
    logger.error("Email and password are required");
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const hashed: string = await brcypt.hash(password, 10);
    //? To lowercase
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      skills,
    });

    if (!user) {
      logger.error("User not created with email: " + emailProtection(email));
      return res.status(400).json({ message: "User not created" });
    }
    logger.info("User created with email: " + emailProtection(email));
    await inngest.send({ name: "user/created", data: { email } });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!
    );
    res.status(200).json({
      token,
      user: safeUser(user),
      message: "User created successfully",
    });
  } catch (error) {
    if (!(error instanceof Error))
      return res.status(500).json({ message: "Internal server error" });
    logger.error({
      message: "Internal Server Error in creating user",
      details: error?.message,
    });
    return res
      .status(500)
      .json({ message: "Internal server error " + (error?.message ?? "") });
  }
};

/**
 * Authenticates a user by verifying their email and password.
 *
 * @param {Response} res - The Express response object.
 * @param {Request} req - The Express request object containing user email and password.
 *
 * @returns {Promise<void>} - Returns a promise that resolves to sending an HTTP response.
 * Sends a 400 status if the user is not found or the password does not match.
 * Sends a 500 status on internal server error.
 */

/**
 * Authenticates a user by verifying their email and password.
 *
 * @param {Response} res - The Express response object.
 * @param {Request} req - The Express request object containing user email and password.
 *
 * @returns {Promise<void>} - Returns a promise that resolves to sending an HTTP response.
 * Sends a 400 status if the user is not found or the password does not match.
 * Sends a 500 status on internal server error.
 */
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    logger.error("Email and password are required");
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.error("User not found with email: " + emailProtection(email));
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await brcypt.compare(password, user.password);
    if (!isMatch) {
      logger.error("User not valid with email: " + emailProtection(email));
      return res
        .status(400)
        .json({ message: "User not valid, password not match" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!
    );
    logger.info("User logged in with email: " + emailProtection(email));
    res.status(200).json({
      token,
      user: safeUser(user),
      message: "User logged in successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error({
        message:
          "Internal Server Error in login user with email: " +
          emailProtection(email),
        details: error.message,
      });
    }
    return res.status(500).json({ message: "Internal server error in login" });
  }
};

/**
 * Logs out a user by verifying the provided JWT token.
 *
 * Extracts the token from the request headers and verifies its validity.
 * If the token is missing or invalid, responds with a 400 status and an error message.
 * If the token is valid, responds with a 200 status and a success message.
 * Logs any errors and responds with a 500 status if any internal server errors occur.
 *
 * @param {Request} req - The Express request object containing the authorization header.
 * @param {Response} res - The Express response object used to send the results or errors.
 *
 * @returns {Promise<void>}
 */
const logout = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    logger.error("Token not found");
    return res.status(400).json({ message: "Token not found" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decoded) {
      logger.error("Token not valid");
      return res.status(400).json({ message: "Token not valid" });
    }
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    if (error instanceof Error) {
      logger.error({
        message: "Internal Server Error in logout user",
        details: error.message,
      });
    }
    return res.status(500).json({ message: "Internal server error in logout" });
  }
};

/**
 * Updates a user with the provided details.
 *
 * Validates that the user is an admin before performing the update.
 * If the user is not an admin, responds with a 403 status and an error message.
 * If the user is not found, responds with a 401 status and an error message.
 * If the update is successful, responds with a 200 status and a success message.
 * Logs any errors and responds with a 500 status if any internal server errors occur.
 *
 * @param {authenticatedRequest} req - The request object containing the user details.
 * @param {Response} res - The response object used to send the results or errors.
 *
 * @returns {Promise<void>}
 */
const updateUser = async (req: authenticatedRequest, res: Response) => {
  const { name, email, role, password, skills = [] } = req.body;
  if (!email) {
    logger.error("Email is required");
    return res.status(400).json({ message: "Email is required" });
  }
  if (!(name || email || role || password || skills.length)) {
    logger.error("At least one field is required to update");
    return res
      .status(400)
      .json({ message: "At least one field is required to update" });
  }
  try {
    if (req.auth?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "User not found" });

    const hashed: string = await (password
      ? brcypt.hash(password, 10)
      : user.password);
    await User.updateOne(
      { email },
      {
        name,
        role,
        password: hashed,
        skills: skills.length ? skills : user.skills,
      }
    );
    logger.info(`Admin updated of user with email: ${emailProtection(email)}`);
    return res.json({ message: "User updated successfully" });
  } catch (error) {
    if (error instanceof Error) {
      logger.error({
        message: "Internal Server Error in update user",
        details: error.message,
      });
    }
    return res
      .status(500)
      .json({ message: "Internal server error in update user" });
  }
};

/**
 * Gets all users in the system.
 *
 * This is a protected route and the user must have the admin role to access it.
 *
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 *
 * @returns {Promise<void>}
 */
const getUsers = async (req: authenticatedRequest, res: Response) => {
  try {
    const token: Token = req.auth as Token;
    if (token?.role !== "admin") {
      logger.error("Unauthorized to get users, role: " + token?.role);
      return res
        .status(401)
        .json({ message: "Unauthorized to get users to want to be admin" });
    }

    const users = await User.find().select("-password -id");
    logger.info("User fetched successfully");
    return res.status(200).json({ users, message: "User found successfully" });
  } catch (error) {
    if (error instanceof Error) {
      logger.error({
        message: "Internal Server Error in get user",
        details: error.message,
      });
    }
    return res
      .status(500)
      .json({ message: "Internal server error in get user" });
  }
};
export { signup, login, logout, updateUser, getUsers };
