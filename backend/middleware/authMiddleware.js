import jwt from 'jsonwebtoken'
import db from '../config/db.js' // Your MySQL database connection
import {promisify} from 'util'

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') // Get token from Authorization header

  if (!token) {
    return res.status(401).json({message: 'Access denied. No token provided.'})
  }

  try {
    req.user = await promisify(jwt.verify)(token, '12345678')

    return next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const refreshToken = req.header('x-refresh-token') // You should send the refresh token in this header

      if (!refreshToken || !refreshToken[0]?.refresh_token) {
        return res.status(400).json({message: 'No refresh token found, please log in again.'})
      }

      try {
        const decodedRefresh = await promisify(jwt.verify)(refreshToken, 'refreshSecret') // Long-lived refresh token

        const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [decodedRefresh.userId])
        const user = userRows[0]

        if (!user || user.refresh_token !== refreshToken) {
          return res.status(403).json({message: 'Invalid refresh token'})
        }

        const newAccessToken = jwt.sign({userId: decodedRefresh.userId}, '12345678', {expiresIn: '1h'})

        res.setHeader('Authorization', `Bearer ${newAccessToken}`)

        req.user = decodedRefresh
        return next()
      } catch (error) {
        return res.status(400).json({message: 'Invalid refresh token.'})
      }
    }

    return res.status(400).json({message: 'Invalid token.'})
  }
}

export default authMiddleware
