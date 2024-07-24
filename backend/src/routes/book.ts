import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import z from 'zod'

const router = Router()
const prisma = new PrismaClient()

const bookBody = z.object({
  title: z.string(),
  author: z.string(),
  genre: z.string(),
  condition: z.string(),
  ownerId: z.number(),
})

router.post('/addbooks', async (req, res) => {
  try {

    const result = bookBody.safeParse(req.body)
    if(!result.success){
      return res.status(400).json({
        message: "Invalid Inputs",
        errors: result.error.errors
      })
    }
  
    const newBook = await prisma.books.create({
      data: {
        title: result.data.title,
        author: result.data.author,
        genre: result.data.genre,
        condition: result.data.condition,
        owner: {
          connect: { id: result.data.ownerId}
        }
      }
    })
  
    return res.status(201).json({
      message: "Book created successfully!",
      newBook
    })

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error
    })
  }

})

export default router