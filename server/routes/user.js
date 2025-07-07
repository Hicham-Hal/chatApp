import express from 'express'
import { checkAuth, login, signUp, updateProfile } from '../controller/User.js'
import { protectRoute } from '../middleware/auth.js'


const userRoute = express.Router()

userRoute.post('/signUp', signUp)
userRoute.post('/login', login)
userRoute.put('/update-profile', protectRoute, updateProfile)
userRoute.get('/check', checkAuth)

export default userRoute