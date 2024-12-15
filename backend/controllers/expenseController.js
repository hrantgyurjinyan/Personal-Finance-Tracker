import db from '../config/db.js'

export const getExpenses = async (req, res) => {
  try {
    const [results] = await db.query('select * from expenses')
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({error: 'Database query failed'})
  }
}
