import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import JWT_SECRET from '../config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import authMiddleware from "../middlewares/authMiddleware";

const prisma = new PrismaClient();
const router = Router();

const signupBody = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

const signinBody = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/signup', async (req, res) => {
  try {
    const result = signupBody.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid Inputs",
        errors: result.error.errors,
      });
    }

    const { username, email, password } = result.data;

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const userId = user.id;

    const token = jwt.sign({ userId }, JWT_SECRET);

    return res.status(201).json({
      message: "User created successfully",
      token: token,
    });
  } catch (error) {
    console.error("Error in signup route:", error); // Detailed logging

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation Error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const result = signinBody.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid Inputs",
        errors: result.error.errors,
      });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    console.error("Error in signin route:", error); // Detailed logging
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

// Protected route example
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Error in profile route:", error); // Detailed logging
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default router;
