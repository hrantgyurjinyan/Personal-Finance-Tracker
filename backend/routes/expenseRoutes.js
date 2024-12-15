import express from 'express'
import {addExpense, getExpenses, getMonthlyReport} from '../controllers/expenseController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, getExpenses)
router.post('/', authMiddleware, addExpense)
router.get('/report', authMiddleware, getMonthlyReport)

export default router
