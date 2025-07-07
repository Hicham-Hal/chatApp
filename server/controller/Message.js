
//Get all users except the logged in user

import cloudinary from "../lib/cloudinay.js"
import Message from "../model/Message.js"
import User from "../model/User.js"
import { io, userSocketMap } from "../server.js"

export const getUsersForSidebar = async(req, res) => {
    try{
        const userId = req.user._id
        const filteredUsers = await User.find({_id: {$ne: userId}})
        const unseenMessages = {}

        const promises = filteredUsers.map(async(user) => {
            const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false})
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }
        })
        
        await Promise.all(promises)
        res.json({ success: true, users: filteredUsers, unseenMessages })

    }catch(err){
        console.log(err.message)
        res.json({ success: false, message: err.message })
    }
}

//Get all messages for selected users

export const getMessagesForSelectedUser = async(req, res) => {
    try{
        const { id: selectedId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: selectedId, receiverId: myId},
                {senderId: myId, receiverId: selectedId}
            ]
        })

        await Message.updateMany({senderId: selectedId, receiverId: myId}, {seen: true})

        res.json({ success: true, messages })

    }catch(err){
        console.log(err.message)
        res.json({ success: false, message: err.message })
    }
}

// API to mark message as seen using message id

export const markMessageAsSeen = async(req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, {seen: true})
        res.json({ success: true })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

//Send message to selected user

export const sendMessage = async(req, res) => {
    try{
        const {text, image} = req.body
        const receiverId = req.params.id
        const senderId = req.user._id

        let imageUrl;

        if(image){
            const upload = await cloudinary.uploader.upload(image)
            imageUrl = upload.secure_url
        }

        const newMessage = await Message.create({
            senderId, receiverId, text, image: imageUrl
        })

        //Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId]
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage', newMessage)
        }

        res.json({ success: true, message: newMessage })
    }catch(err){
        console.log(err)
        res.json({ success: false, message: err.message })
    }
}