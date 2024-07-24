"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const book_1 = __importDefault(require("./routes/book"));
const bookshelf_1 = __importDefault(require("./routes/bookshelf"));
const exchange_1 = __importDefault(require("./routes/exchange"));
const review_1 = __importDefault(require("./routes/review"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v1/users", user_1.default);
app.use("/api/v1/books", book_1.default);
app.use("/api/v1/bookshelves", bookshelf_1.default);
app.use("/api/v1/exchanges", exchange_1.default);
app.use("/api/v1/reviews", review_1.default);
app.use("/api/v1/wishlists", wishlist_1.default);
app.listen(3001, () => {
    console.log("server is listening on port 3001");
});
exports.default = app;
