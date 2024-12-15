import express from 'express'
import cors from 'cors'
import authMiddleware from './middleware/authMiddleware.js'
import expenseRoutes from './routes/expenseRoutes.js'
import {login, signUp} from './controllers/authController.js'
import { refreshToken } from './controllers/authController.js';


const app = express()

app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.post('/signup', signUp)
app.post('/login', login)
app.post('/refresh-token', refreshToken);


app.use('/api/expenses', authMiddleware, expenseRoutes)


const PORT = 5000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
