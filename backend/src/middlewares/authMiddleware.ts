import JWT_SECRET from "../config";
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from "express";


interface AuthRequest extends Request {
  user?: { userId: number };
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if(!authHeader || !authHeader.startsWith('Bearer ')){
    return res.status(403).json({
      message: "Trouble with auth header"
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.user = decoded;
    next();
  } catch (error) {
    return
  }
}

export default authMiddleware