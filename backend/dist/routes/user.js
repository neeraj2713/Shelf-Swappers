"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const signupBody = zod_1.z.object({
    username: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const signinBody = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = signupBody.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid Inputs",
                errors: result.error.errors,
            });
        }
        const { username, email, password } = result.data;
        const existingUser = yield prisma.user.findFirst({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        const userId = user.id;
        const token = jsonwebtoken_1.default.sign({ userId }, config_1.default);
        return res.status(201).json({
            message: "User created successfully",
            token: token,
        });
    }
    catch (error) {
        console.error("Error in signup route:", error); // Detailed logging
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                message: "Validation Error",
                errors: error.errors,
            });
        }
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
}));
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = signinBody.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid Inputs",
                errors: result.error.errors,
            });
        }
        const { email, password } = result.data;
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.default);
        res.json({
            message: "Login successful",
            token: token,
        });
    }
    catch (error) {
        console.error("Error in signin route:", error); // Detailed logging
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
}));
// Protected route example
router.get('/profile', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const user = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error in profile route:", error); // Detailed logging
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
}));
exports.default = router;
