import express from 'express'
import { getMessagesForSelectedUser, getUsersForSidebar, markMessageAsSeen, sendMessage } from '../controller/Message.js'
import { protectRoute } from '../middleware/auth.js'

const messageRoute = express.Router()

messageRoute.get('/getUsers', protectRoute, getUsersForSidebar)
messageRoute.get('/:id', protectRoute, getMessagesForSelectedUser)
messageRoute.put('/mark/:id', protectRoute, markMessageAsSeen)
messageRoute.post('/send/:id', protectRoute, sendMessage)

export default messageRoute