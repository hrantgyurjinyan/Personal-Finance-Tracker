import db from '../config/db.js'

export async function getExpenses(req, res) {
  try {
    const [rows] = await db.query('select * from expenses order by created_at desc')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    res.status(500).json({error: 'Failed to fetch expenses'})
  }
}

export async function addExpense(req, res) {
  const {title, amount, category} = req.body

  if (!title || !amount || !category) {
    return res.status(400).json({error: 'Missing required fields'})
  }

  try {
    const [result] = await db.query('insert into expenses (title, amount, category) values (?, ?, ?)', [title, amount, category])

    res.status(201).json({
      id: result.insertId,
      title,
      amount,
      category,
      created_at: new Date()
    })
  } catch (error) {
    console.error('Error adding expense:', error)
    res.status(500).json({error: 'Failed to add expense'})
  }
}

export async function getMonthlyReport(req, res) {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  try {
    const [rows] = await db.query(
      `SELECT category, SUM(amount) as total
       FROM expenses
       WHERE MONTH(created_at) = ?
         AND YEAR(created_at) = ?
       GROUP BY category`,
      [currentMonth, currentYear]
    )

    res.json(rows)
  } catch (error) {
    console.error('Error fetching monthly report:', error)
    res.status(500).json({error: 'Failed to generate report'})
  }
}
