import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/db.js'

const generateTokens = (user) => {
  const accessToken = jwt.sign({userId: user.id}, '12345678', {expiresIn: '1h'}) // Short-lived
  const refreshToken = jwt.sign({userId: user.id}, 'refreshSecret', {expiresIn: '7d'}) // Long-lived

  return {accessToken, refreshToken}
}

export const signUp = async (req, res) => {
  const {username, email, password} = req.body

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    )
    res.status(201).json({message: 'User registered successfully!'})
  } catch (err) {
    res.status(500).json({message: 'Error registering user.'})
  }
}

export const login = async (req, res) => {
  const {email, password} = req.body

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    const user = rows[0]

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({message: 'Invalid email or password'})
    }

    const {accessToken, refreshToken} = generateTokens(user)
    await db.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id])

    res.json({accessToken, refreshToken})
  } catch (err) {
    res.status(500).json({message: 'Error logging in'})
  }
}

export const refreshToken = async (req, res) => {
  const {refreshToken} = req.body

  if (!refreshToken) return res.status(400).json({message: 'Refresh token required'})

  try {
    const decoded = jwt.verify(refreshToken, 'refreshSecret')
    const userId = decoded.userId

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId])
    const user = rows[0]

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({message: 'Invalid refresh token'})
    }

    const accessToken = jwt.sign({userId: user.id}, '12345678', {expiresIn: '1h'})

    res.json({accessToken})
  } catch (err) {
    res.status(400).json({message: 'Invalid refresh token'})
  }
}
