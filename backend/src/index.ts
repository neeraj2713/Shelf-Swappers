import express from 'express'
import cors from 'cors'
import userRouter from './routes/user'
import bookRouter from './routes/book'
import bookShelfRouter from './routes/bookshelf'
import exchangeRouter from './routes/exchange'
import reviewRouter from './routes/review'
import wishlistRouter from './routes/wishlist'

const app = express();

app.use(cors())

app.use("api/v1/users", userRouter)
app.use("api/v1/books", bookRouter)
app.use("api/v1/bookshelves", bookShelfRouter)
app.use("api/v1/exchanges", exchangeRouter)
app.use("api/v1/reviews", reviewRouter)
app.use("api/v1/wishlists", wishlistRouter)

export default app