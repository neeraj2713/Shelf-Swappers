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
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = __importDefault(require("zod"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const bookBody = zod_1.default.object({
    title: zod_1.default.string(),
    author: zod_1.default.string(),
    genre: zod_1.default.string(),
    condition: zod_1.default.string(),
    ownerId: zod_1.default.number(),
});
router.post('/addbooks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = bookBody.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid Inputs",
                errors: result.error.errors
            });
        }
        const newBook = yield prisma.books.create({
            data: {
                title: result.data.title,
                author: result.data.author,
                genre: result.data.genre,
                condition: result.data.condition,
                owner: {
                    connect: { id: result.data.ownerId }
                }
            }
        });
        return res.status(201).json({
            message: "Book created successfully!",
            newBook
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error
        });
    }
}));
exports.default = router;
