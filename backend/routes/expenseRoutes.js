import express from 'express'
import {addExpense, getExpenses, getMonthlyReport} from '../controllers/expenseController.js'

const router = express.Router()

router.get('/', getExpenses)
router.post('/', addExpense)
router.get('/report', getMonthlyReport)

export default router
