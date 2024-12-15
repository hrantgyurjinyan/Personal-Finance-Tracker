import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import expenseRoutes from './routes/expenseRoutes.js'
import { signUp, login } from './controllers/authController.js'


const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/expenses', expenseRoutes)

app.post('/signup', signUp);
app.post('/login', login);

const PORT = 5000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
