import db from '../config/db.js'

export async function getExpenses(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM expenses ORDER BY created_at DESC')
    res.json(rows) // Send the list of expenses as the response
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
    const [result] = await db.query('INSERT INTO expenses (title, amount, category) VALUES (?, ?, ?)', [title, amount, category])

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
