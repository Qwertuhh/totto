import express from "express";
import {
  signup,
  login,
  logout,
  updateUser,
  getUsers,
} from "@/controllers/user.controller";
import auth from "@/middlewares/auth";

const router = express.Router();

//* Authtentication of a User
router.post("/auth/signup", signup as unknown as express.RequestHandler);
router.post("/auth/login", login as unknown as express.RequestHandler);
router.post("/auth/logout", logout as unknown as express.RequestHandler);
router.put(
  "/",
  auth as unknown as express.RequestHandler,
  updateUser as unknown as express.RequestHandler
);
router.get(
  "/",
  auth as unknown as express.RequestHandler,
  getUsers as unknown as express.RequestHandler
);

export default router;
